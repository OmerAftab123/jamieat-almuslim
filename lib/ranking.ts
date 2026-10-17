import type { Dataset } from '@/lib/data';
import { CRITERION_KEYS } from '@/lib/schemas';

export type RankedProgramme = {
  rank: number;
  degreeId: string;
  degreeName: string;
  familyName: string;
  /** Unrounded equal-weight mean of the seven criteria (0–4). Used for ordering. */
  overall: number;
  confidence: string;
  matchType: string;
};

/**
 * Rank a university's verified programmes by the equal-weight mean of the seven family criteria.
 * Ties share a rank (competition ranking). A programme whose family has any missing score is excluded
 * rather than scored as 0.
 */
export function rankProgrammes(d: Dataset, universityId: string): RankedProgramme[] {
  const uni = d.universities.find((u) => u.id === universityId);
  if (!uni) return [];
  const rows: Omit<RankedProgramme, 'rank'>[] = [];
  for (const p of uni.programs as Array<{ degreeId: string; status: string; matchType: string }>) {
    if (p.status !== 'verified') continue;
    const degree = d.degrees.find((x) => x.id === p.degreeId);
    const family = degree && d.families.find((f) => f.id === degree.family);
    if (!degree || !family) continue;
    const scores = CRITERION_KEYS.map((k) => family.scores[k]?.score);
    if (scores.some((s) => typeof s !== 'number')) continue;
    const overall = (scores as number[]).reduce((a, b) => a + b, 0) / CRITERION_KEYS.length;
    rows.push({
      degreeId: degree.id,
      degreeName: degree.name,
      familyName: family.name,
      overall,
      confidence: family.confidence,
      matchType: p.matchType,
    });
  }
  rows.sort((a, b) => b.overall - a.overall || a.degreeName.localeCompare(b.degreeName));
  let rank = 0;
  let previous: number | null = null;
  return rows.map((r, i) => {
    if (previous === null || r.overall !== previous) rank = i + 1;
    previous = r.overall;
    return { rank, ...r };
  });
}
