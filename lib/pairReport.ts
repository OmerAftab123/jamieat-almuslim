import type { Dataset } from '@/lib/data';
import { answerFundamentalQuestion, type FundamentalAnswer } from '@/lib/answer';
import { CRITERION_KEYS } from '@/lib/schemas';
import type { MatchInput } from '@/lib/matching';

/**
 * Full report for ONE bachelor's category at ONE QS university, for a Pakistani international
 * undergraduate. It is built only from stored, dated records. Anything not recorded is returned
 * as "not researched" or "not verified" and is never presented as a "no".
 */

export const AWARD_TYPES = ['merit', 'need', 'national', 'regional', 'institutional', 'sports'] as const;
export type AwardType = (typeof AWARD_TYPES)[number];

export const AWARD_TYPE_LABEL: Record<AwardType, string> = {
  merit: 'Merit-based',
  need: 'Need-based',
  national: 'National (home or host government)',
  regional: 'Regional (country group or region)',
  institutional: 'Institutional (the university itself)',
  sports: 'Sports',
};

export type ScholarshipLine = {
  type: AwardType;
  name: string;
  origin: 'record' | 'dossier' | 'none';
  status: string;
  detail: string;
  sourceIds: string[];
  /** false when a stored rule says the award does not cover this category or this applicant */
  appliesToCategory: boolean;
  note: string;
};

export type ReportItem = { item: string; detail: string; status: string; sourceIds: string[] };

export type RoadmapStage = {
  stage: number;
  title: string;
  evidence: 'verified' | 'partial' | 'not-researched';
  actions: string[];
  dates: string[];
  sourceIds: string[];
};

export type PairReport = {
  question: string;
  degree: { id: string; name: string; family: string; familyName: string };
  university: { id: string; name: string; qsRank: string; country: string; officialWebsite: string | null };
  programme: { status: 'verified' | 'not-verified'; officialTitle: string | null; officialUrl: string | null; note: string };
  answer: FundamentalAnswer;
  requirements: { general: ReportItem[]; subject: ReportItem[]; admissionsRecorded: boolean };
  trends: { status: string; detail: string; items: Array<{ label: string; value: string; sourceId: string; kind: string }> };
  scholarships: Record<AwardType, ScholarshipLine[]>;
  reasoning: {
    universityFor: string[];
    universityAgainst: string[];
    degreeFor: string[];
    degreeAgainst: string[];
    degreeCriteria: Array<{ key: string; score: number; rationale: string }>;
    degreeResearchStatus: string;
  };
  roadmap: RoadmapStage[];
  completeness: { score: number; of: number; checks: Array<{ label: string; ok: boolean }> };
  disclaimers: string[];
};

type AnyRecord = Record<string, unknown>;

/** Maps dossier route wording to the six award types. */
export function routeTypes(route: string): AwardType[] {
  const r = route.toLowerCase();
  const out: AwardType[] = [];
  if (r.includes('merit')) out.push('merit');
  if (r.includes('need')) out.push('need');
  if (r.includes('national')) out.push('national');
  if (r.includes('regional')) out.push('regional');
  if (r.includes('institution')) out.push('institutional');
  if (r.includes('sport')) out.push('sports');
  return out;
}

function recordTypes(s: { awardType: string; scholarshipTypes?: AwardType[] }): AwardType[] {
  if (s.scholarshipTypes && s.scholarshipTypes.length > 0) return s.scholarshipTypes;
  switch (s.awardType) {
    case 'need-based':
      return ['need'];
    case 'merit-based':
    case 'nomination':
      return ['merit'];
    case 'mixed':
      return ['merit', 'need'];
    default:
      return [];
  }
}

const NOT_RESEARCHED_NATIONAL =
  'No verified national undergraduate route to a QS top-150 university is recorded for Pakistani students (HEC need-based aid is for public universities in Pakistan; see docs/RESEARCH_COVERAGE.md).';

export function buildPairReport(d: Dataset, degreeId: string, universityId: string, intakeYear = 2027): PairReport | null {
  const degree = d.degrees.find((x) => x.id === degreeId);
  const uni = d.universities.find((u) => u.id === universityId);
  if (!degree || !uni) return null;
  const family = d.families.find((f) => f.id === degree.family);
  const dossier = d.freeStudy.dossiers.find((x) => x.universityId === uni.id) ?? null;

  const input: MatchInput = {
    degreeId,
    universityId,
    intakeYear,
    applicantCountry: 'Pakistan',
    overallPercentage: null,
    englishTest: 'unknown',
    needsFinancialAid: null,
    annualBudgetUsd: null,
    avoidInterestFinance: false,
  };
  const answer = answerFundamentalQuestion(d, input);

  // ---- Programme (is this category offered here, per official records?) ----
  const progRows = (uni.programs as AnyRecord[]).filter((p) => p.degreeId === degreeId);
  const prog = progRows.find((p) => p.status === 'verified') ?? null;
  const programme: PairReport['programme'] = prog
    ? {
        status: 'verified',
        officialTitle: (prog.officialTitle as string) ?? null,
        officialUrl: (prog.officialUrl as string) ?? null,
        note: (prog.matchNote as string) ?? 'Programme verified against the official course list.',
      }
    : {
        status: 'not-verified',
        officialTitle: null,
        officialUrl: null,
        note: 'This category is not verified as offered here. Check the official undergraduate course list before relying on any route.',
      };

  // ---- Requirements ----
  const general: ReportItem[] = [];
  const subject: ReportItem[] = [];
  if (dossier) {
    for (const it of dossier.officialRequirements) {
      const row = { item: it.item, detail: it.detail, status: it.status, sourceIds: it.sourceIds };
      if (/subject|programme/i.test(it.item)) subject.push(row);
      else general.push(row);
    }
  }
  const admissionsRecorded = !!uni.admissions && typeof uni.admissions === 'object';
  if (admissionsRecorded && general.length === 0) {
    for (const [k, v] of Object.entries(uni.admissions as AnyRecord)) {
      if (k === 'sourceId' || k === 'lastChecked' || v == null) continue;
      const text = Array.isArray(v)
        ? v.map((x) => (typeof x === 'object' && x ? Object.values(x as AnyRecord).join(' / ') : String(x))).join('; ')
        : String(v);
      general.push({ item: k, detail: text, status: 'verified-official', sourceIds: [(uni.admissions as AnyRecord).sourceId as string].filter(Boolean) });
    }
  }
  if (general.length === 0) {
    general.push({ item: 'Admission requirements', detail: 'Not researched for this university.', status: 'not-researched', sourceIds: [] });
  }
  if (subject.length === 0) {
    subject.push({
      item: 'Subject-specific requirements',
      detail:
        programme.status === 'verified'
          ? 'Not recorded for this category. Check the programme page on the official course list.'
          : 'Not verified: the category is not verified as offered here.',
      status: 'not-verified',
      sourceIds: [],
    });
  }

  // ---- Trends (labelled, never presented as official) ----
  const trends = dossier
    ? {
        status: dossier.unofficialTrends.status,
        detail: dossier.unofficialTrends.detail,
        items: dossier.trends.map((t) => ({ label: t.label, value: t.value, sourceId: t.sourceId, kind: t.kind })),
      }
    : { status: 'not-recorded', detail: 'No trend or unofficial data recorded for this university.', items: [] };

  // ---- Scholarships by six types ----
  const scholarships = Object.fromEntries(AWARD_TYPES.map((t) => [t, [] as ScholarshipLine[]])) as Record<AwardType, ScholarshipLine[]>;
  const famId = degree.family;
  for (const s of d.scholarships.filter((x) => x.universityId === uni.id)) {
    const scope = s.eligibility.degreeFamilyScope;
    const categoryOk = scope === 'any' || scope.includes(famId);
    const nationalityOk =
      s.eligibility.applicantScope !== 'nationalities' ||
      !s.eligibility.nationalities ||
      s.eligibility.nationalities.length === 0 ||
      s.eligibility.nationalities.some((n) => /pakistan/i.test(n));
    const applies = categoryOk && nationalityOk;
    const note = !categoryOk
      ? `Does not cover this category: ${s.eligibility.programmeScopeNote}`
      : !nationalityOk
        ? 'Citizenship rule does not include Pakistan.'
        : s.eligibility.applicantScope === 'nationalities'
          ? 'Citizenship rule applies; Pakistan is not confirmed.'
          : '';
    const types = recordTypes(s);
    const line = (t: AwardType): ScholarshipLine => ({
      type: t,
      name: s.name,
      origin: 'record',
      status: applies ? s.verificationStatus : 'not-applicable',
      detail: `${s.classification} (${s.classificationNote})`,
      sourceIds: [],
      appliesToCategory: applies,
      note,
    });
    for (const t of types) scholarships[t].push({ ...line(t), sourceIds: s.sources ?? [] });
  }
  if (dossier) {
    for (const row of dossier.scholarships) {
      const types = routeTypes(row.route);
      if (types.length === 0) continue;
      for (const t of types) {
        scholarships[t].push({
          type: t,
          name: row.route,
          origin: 'dossier',
          status: row.status,
          detail: row.detail,
          sourceIds: row.sourceIds,
          appliesToCategory: true,
          note: '',
        });
      }
    }
  }
  for (const t of AWARD_TYPES) {
    if (scholarships[t].length === 0) {
      scholarships[t].push({
        type: t,
        name: 'No record',
        origin: 'none',
        status: 'not-researched',
        detail:
          t === 'national'
            ? NOT_RESEARCHED_NATIONAL
            : t === 'sports'
              ? 'No sports award is recorded for this university. Check the athletics or sports scholarship pages.'
              : 'Not researched for this university. This is not a finding that no such award exists.',
        sourceIds: [],
        appliesToCategory: true,
        note: '',
      });
    }
  }

  // ---- Reasoning ----
  const criteria = family
    ? CRITERION_KEYS.map((k) => {
        const s = (family.scores as Record<string, { score: number; rationale: string }>)[k];
        return { key: k, score: s?.score ?? -1, rationale: s?.rationale ?? 'Not scored.' };
      })
    : [];
  const degreeFor = criteria.filter((c) => c.score >= 3).map((c) => `${c.key}: ${c.score}/4. ${c.rationale}`);
  const degreeAgainst = criteria.filter((c) => c.score >= 0 && c.score <= 1).map((c) => `${c.key}: ${c.score}/4. ${c.rationale}`);

  const universityFor = [...(dossier?.reasoning.forStudy ?? [])];
  const universityAgainst = [...(dossier?.reasoning.againstOrCaution ?? [])];
  if (!dossier) universityAgainst.push('No free-study dossier is recorded for this university, so its reasons are not yet researched.');
  const qsDisplay = String((uni.qsRank as AnyRecord).display ?? '');
  if (qsDisplay) universityFor.push(`QS rank ${qsDisplay} (QS 2027 record in the dataset).`);

  // ---- Roadmap ----
  const roadmap: RoadmapStage[] = [
    {
      stage: 1,
      title: 'Confirm the category is offered at this university',
      evidence: programme.status === 'verified' ? 'verified' : 'not-researched',
      actions: [
        programme.status === 'verified'
          ? 'Check the official programme page for the intake you want.'
          : 'Find this category on the university undergraduate course list and confirm the intake.',
        'Check the entry requirements for the category, including any subject rules.',
      ],
      dates: [],
      sourceIds: [],
    },
    {
      stage: 2,
      title: 'Meet the official admission requirements',
      evidence: general[0]?.status === 'not-researched' ? 'not-researched' : 'partial',
      actions: [
        ...general.filter((g) => g.status !== 'not-researched').map((g) => `${g.item}: ${g.detail}`),
        'Confirm your qualification equivalence with the university in writing.',
      ],
      dates: [],
      sourceIds: general.flatMap((g) => g.sourceIds),
    },
    {
      stage: 3,
      title: 'Plan the funding route before you apply',
      evidence: answer.free.verdict === 'not-researched' ? 'not-researched' : 'partial',
      actions: [
        `Free-study verdict: ${answer.free.label}`,
        'Check each award type above: merit, need, national, regional, institutional and sports.',
        'Budget for any cost the free route does not cover, and do not count loans as free.',
      ],
      dates: dossier ? dossier.roadmap.map((r) => `${r.window}: ${r.steps.join(' ')}`) : [],
      sourceIds: [],
    },
    {
      stage: 4,
      title: 'Apply and submit scholarship applications',
      evidence: dossier ? 'partial' : 'not-researched',
      actions: dossier ? [...dossier.answers.how] : ['Apply through the official portal by the official deadline.'],
      dates: [],
      sourceIds: [],
    },
    {
      stage: 5,
      title: 'Study and keep the award',
      evidence: 'partial',
      actions: [
        'Check the renewal rules for any award you receive, such as minimum grades or a continuing-need review.',
        'Keep copies of every offer, award letter and deadline.',
      ],
      dates: [],
      sourceIds: [],
    },
  ];

  // ---- Completeness (five evidence checks) ----
  const checks = [
    { label: 'Programme verified on the official course list', ok: programme.status === 'verified' },
    { label: 'Official admission requirements recorded', ok: admissionsRecorded || general.some((g) => g.status === 'verified-official') },
    { label: 'Subject-specific requirements verified', ok: subject.some((s) => s.status === 'verified-official' || s.status === 'verified-official-absence') },
    {
      label: 'Scholarship records by type (not all not-researched)',
      ok: AWARD_TYPES.some((t) => scholarships[t].some((s) => s.origin !== 'none')),
    },
    { label: 'Trend or unofficial data recorded and labelled', ok: trends.status !== 'not-recorded' },
  ];

  return {
    question: `Can, should, and how can a Pakistani international student apply, get admitted, and study ${degree.name} at ${uni.name} for free?`,
    degree: { id: degree.id, name: degree.name, family: degree.family, familyName: family?.name ?? degree.family },
    university: {
      id: uni.id,
      name: uni.name,
      qsRank: String((uni.qsRank as AnyRecord).display ?? ''),
      country: uni.country,
      officialWebsite: uni.officialWebsite ?? null,
    },
    programme,
    answer,
    requirements: { general, subject, admissionsRecorded },
    trends,
    scholarships,
    reasoning: {
      universityFor,
      universityAgainst,
      degreeFor,
      degreeAgainst,
      degreeCriteria: criteria,
      degreeResearchStatus: d.meta.familiesResearchStatus,
    },
    roadmap,
    completeness: { score: checks.filter((c) => c.ok).length, of: checks.length, checks },
    disclaimers: [
      ...answer.disclaimers,
      'Category scores are analyst-draft opinions for the whole degree family, not university-specific results.',
      'Scholarship routes are not offers. Eligibility, deadlines and amounts must be confirmed with the funder.',
    ],
  };
}

/** Counts how many category x university pairs have each kind of evidence. Cheap; no per-pair evaluation. */
export function coverageSummary(d: Dataset) {
  let programmeVerified = 0;
  for (const u of d.universities) {
    for (const p of u.programs as AnyRecord[]) if (p.status === 'verified') programmeVerified++;
  }
  const pairs = d.degrees.length * d.universities.length;
  const dossierUnis = new Set(d.freeStudy.dossiers.map((x) => x.universityId)).size;
  const admissionsUnis = d.universities.filter((u) => !!u.admissions && typeof u.admissions === 'object').length;
  return {
    pairs,
    programmeVerifiedPairs: programmeVerified,
    universitiesWithDossier: dossierUnis,
    universitiesWithAdmissions: admissionsUnis,
    familiesAnalystDraft: d.families.length,
  };
}
