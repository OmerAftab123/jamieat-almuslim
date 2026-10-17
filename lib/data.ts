import { ZodError } from 'zod';
import degreesJson from '@/data/degrees.json';
import familiesJson from '@/data/families.json';
import universitiesJson from '@/data/universities.json';
import scholarshipsJson from '@/data/scholarships.json';
import sourcesJson from '@/data/sources.json';
import fxJson from '@/data/fx.json';
import {
  degreesFileSchema,
  familiesFileSchema,
  fxSchema,
  scholarshipsFileSchema,
  sourcesFileSchema,
  universitiesFileSchema,
  type Degree,
  type Family,
  type FxRate,
  type Scholarship,
  type Source,
  type University,
} from '@/lib/schemas';

export type Dataset = {
  degrees: Degree[];
  families: Family[];
  universities: University[];
  scholarships: Scholarship[];
  sources: Source[];
  fx: FxRate;
  meta: {
    degreesVersion: string;
    familiesVersion: string;
    familiesResearchStatus: string;
    familiesResearchStatusNote: string;
    universitiesVersion: string;
    universitiesCoverage: {
      source: string;
      edition: string;
      rankRangeTranscribed: string;
      rankRangePending: string;
      crossCheckStatus: string;
      verificationDate: string;
    };
    scholarshipsVersion: string;
    scholarshipClassifications: Record<string, string>;
    sourcesVersion: string;
  };
};

/** Parse every dataset with its schema and return typed data. Throws a readable Error on failure. */
export function parseDataset(raw: {
  degrees: unknown;
  families: unknown;
  universities: unknown;
  scholarships: unknown;
  sources: unknown;
  fx: unknown;
}): Dataset {
  const fail = (file: string, e: unknown): never => {
    if (e instanceof ZodError) {
      const details = e.issues
        .slice(0, 5)
        .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
        .join('\n');
      throw new Error(`Invalid dataset file ${file}:\n${details}`);
    }
    throw e;
  };

  let degrees, families, universities, scholarships, sources, fx;
  try {
    degrees = degreesFileSchema.parse(raw.degrees);
  } catch (e) {
    fail('data/degrees.json', e);
  }
  try {
    families = familiesFileSchema.parse(raw.families);
  } catch (e) {
    fail('data/families.json', e);
  }
  try {
    universities = universitiesFileSchema.parse(raw.universities);
  } catch (e) {
    fail('data/universities.json', e);
  }
  try {
    scholarships = scholarshipsFileSchema.parse(raw.scholarships);
  } catch (e) {
    fail('data/scholarships.json', e);
  }
  try {
    sources = sourcesFileSchema.parse(raw.sources);
  } catch (e) {
    fail('data/sources.json', e);
  }
  try {
    fx = fxSchema.parse(raw.fx);
  } catch (e) {
    fail('data/fx.json', e);
  }

  return {
    degrees: degrees!.degrees,
    families: families!.families,
    universities: universities!.universities,
    scholarships: scholarships!.scholarships,
    sources: sources!.sources,
    fx: fx!,
    meta: {
      degreesVersion: degrees!.datasetVersion,
      familiesVersion: families!.datasetVersion,
      familiesResearchStatus: families!.researchStatus,
      familiesResearchStatusNote: families!.researchStatusNote,
      universitiesVersion: universities!.datasetVersion,
      universitiesCoverage: universities!.coverage,
      scholarshipsVersion: scholarships!.datasetVersion,
      scholarshipClassifications: scholarships!.classificationDefinitions,
      sourcesVersion: sources!.datasetVersion,
    },
  };
}

/**
 * Cross-file referential checks. Returns human-readable problems (empty array = healthy).
 * Used by tests, the validate-data script, and the data loader.
 */
export function checkIntegrity(d: Dataset): string[] {
  const problems: string[] = [];
  const sourceIds = new Set(d.sources.map((s) => s.id));
  const familyIds = new Set(d.families.map((f) => f.id));
  const uniIds = new Set(d.universities.map((u) => u.id));
  const scholarshipIds = new Set(d.scholarships.map((s) => s.id));

  const dupes = (ids: string[]) => ids.filter((id, i) => ids.indexOf(id) !== i);
  for (const id of dupes(d.degrees.map((x) => x.id))) problems.push(`duplicate degree id: ${id}`);
  for (const id of dupes(d.families.map((x) => x.id))) problems.push(`duplicate family id: ${id}`);
  for (const id of dupes(d.universities.map((x) => x.id))) problems.push(`duplicate university id: ${id}`);
  for (const id of dupes(d.scholarships.map((x) => x.id))) problems.push(`duplicate scholarship id: ${id}`);
  for (const id of dupes(d.sources.map((x) => x.id))) problems.push(`duplicate source id: ${id}`);

  for (const deg of d.degrees) {
    if (!familyIds.has(deg.family)) problems.push(`degree ${deg.id} references unknown family ${deg.family}`);
  }
  for (const fam of d.families) {
    for (const s of fam.sources) {
      if (!sourceIds.has(s)) problems.push(`family ${fam.id} references unknown source ${s}`);
    }
  }
  for (const u of d.universities) {
    if (!sourceIds.has(u.qsSourceId)) problems.push(`university ${u.id} references unknown source ${u.qsSourceId}`);
    for (const sid of u.scholarshipIds) {
      if (!scholarshipIds.has(sid)) problems.push(`university ${u.id} references unknown scholarship ${sid}`);
    }
    if (u.qsRank.tied && u.qsRank.display === String(u.qsRank.position)) {
      problems.push(`university ${u.id} is marked tied but its rank display has no '=' notation`);
    }
    if (!u.qsRank.tied && u.qsRank.display !== String(u.qsRank.position)) {
      problems.push(`university ${u.id} is not tied but its rank display differs from its position`);
    }
  }
  for (const s of d.scholarships) {
    if (!uniIds.has(s.universityId)) problems.push(`scholarship ${s.id} references unknown university ${s.universityId}`);
    for (const sid of s.sources) {
      if (!sourceIds.has(sid)) problems.push(`scholarship ${s.id} references unknown source ${sid}`);
    }
    if (s.classification === 'full-ride' && s.coverage.livingStipend?.toLowerCase().startsWith('not')) {
      // A full ride must list living coverage; flag if the record says none is stated.
      problems.push(`scholarship ${s.id} is labelled full-ride but its living coverage says none is stated`);
    }
    if (s.loansIncluded && s.classification !== 'unconfirmed' && s.classification !== 'partial') {
      problems.push(`scholarship ${s.id} includes loans but is not classified as partial or unconfirmed`);
    }
  }
  if (!sourceIds.has(d.fx.sourceId)) problems.push(`fx references unknown source ${d.fx.sourceId}`);
  return problems;
}

let cached: Dataset | null = null;

/** Load, validate and cache the full dataset. Throws if any file is invalid or inconsistent. */
export function getDataset(): Dataset {
  if (cached) return cached;
  const d = parseDataset({
    degrees: degreesJson,
    families: familiesJson,
    universities: universitiesJson,
    scholarships: scholarshipsJson,
    sources: sourcesJson,
    fx: fxJson,
  });
  const problems = checkIntegrity(d);
  if (problems.length > 0) {
    throw new Error(`Dataset integrity problems:\n  - ${problems.join('\n  - ')}`);
  }
  cached = d;
  return d;
}

/** Normalise a name for duplicate detection: lower-case, collapse punctuation and whitespace. */
export function normaliseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Returns every normalised name or alias that is claimed by more than one degree record. */
export function findDuplicateDegreeNames(degrees: Degree[]): string[] {
  const seen = new Map<string, string>();
  const dupes = new Set<string>();
  for (const deg of degrees) {
    for (const label of [deg.name, ...deg.aliases]) {
      const key = normaliseName(label);
      const owner = seen.get(key);
      if (owner && owner !== deg.id) dupes.add(`${label} (${owner} and ${deg.id})`);
      else seen.set(key, deg.id);
    }
  }
  return [...dupes];
}

/** Returns university names that appear more than once once normalised. */
export function findDuplicateUniversityNames(universities: University[]): string[] {
  const counts = new Map<string, string[]>();
  for (const u of universities) {
    const key = normaliseName(u.name);
    counts.set(key, [...(counts.get(key) ?? []), u.id]);
  }
  return [...counts.entries()].filter(([, ids]) => ids.length > 1).map(([k, ids]) => `${k}: ${ids.join(', ')}`);
}

export function sourceMap(d: Dataset): Map<string, Source> {
  return new Map(d.sources.map((s) => [s.id, s]));
}
