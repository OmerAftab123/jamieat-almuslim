import { CRITERION_KEYS, type CriterionKey, type Family } from '@/lib/schemas';

export { CRITERION_KEYS, type CriterionKey };

export const CRITERION_META: Record<CriterionKey, { label: string; short: string; question: string }> = {
  islamic: {
    label: 'Islamic alignment',
    short: 'Islamic',
    question: 'How well do the realistic career pathways align with Islamic principles and common religious preferences?',
  },
  benefit: {
    label: 'Benefit to people and society',
    short: 'Benefit',
    question: 'How much potential does the field have to contribute to human welfare and real-world problem solving?',
  },
  financial: {
    label: 'Financial lucrativeness',
    short: 'Financial',
    question: 'What are the realistic earnings, progression and long-term financial prospects?',
  },
  futureResilience: {
    label: 'Future resilience',
    short: 'Future',
    question: 'How likely is the field to remain relevant as technology, industries and society change?',
  },
  aiResilience: {
    label: 'AI resilience',
    short: 'AI',
    question: 'How exposed are the field\u2019s tasks to AI-driven automation or displacement? (Higher = more resilient.)',
  },
  employmentStability: {
    label: 'Employment stability',
    short: 'Stability',
    question: 'What are the prospects for stable, sustainable employment across economic conditions and career stages?',
  },
  flexibility: {
    label: 'Flexibility',
    short: 'Flexibility',
    question: 'How transferable are the skills, and how many alternative careers, locations or self-employment options exist?',
  },
};

export const SCORE_LABELS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'MUST NOT',
  1: 'SHOULD NOT',
  2: 'CAN / MAY',
  3: 'SHOULD',
  4: 'MUST',
};

export type Weights = Record<CriterionKey, number>;

export const EQUAL_WEIGHTS: Weights = Object.fromEntries(
  CRITERION_KEYS.map((k) => [k, 1]),
) as Weights;

/**
 * Normalise arbitrary non-negative weights so they sum to exactly 1 (100%).
 * Throws when weights are invalid or all zero, so the UI can show a clear message.
 */
export function normalizeWeights(input: Partial<Record<CriterionKey, number>>): Weights {
  let total = 0;
  for (const k of CRITERION_KEYS) {
    const v = input[k] ?? 0;
    if (!Number.isFinite(v) || v < 0) {
      throw new RangeError(`Weight for ${CRITERION_META[k].label} must be a finite number >= 0.`);
    }
    total += v;
  }
  if (total <= 0) {
    throw new RangeError('At least one criterion weight must be greater than zero.');
  }
  return Object.fromEntries(CRITERION_KEYS.map((k) => [k, (input[k] ?? 0) / total])) as Weights;
}

export type FamilyScore = {
  familyId: string;
  name: string;
  /** Per-criterion score (0-4) or null when the research is missing. Never coerced to 0. */
  scores: Record<CriterionKey, number | null>;
  /** Exact weighted average on the 0-4 scale. Null when any criterion is missing. */
  overall: number | null;
  /** Display value rounded to one decimal place. Ordering always uses the exact value. */
  overallDisplay: string | null;
  completeness: number;
  missing: CriterionKey[];
};

/** Score one family with the supplied weights (normalised internally). */
export function scoreFamily(family: Family, rawWeights: Partial<Record<CriterionKey, number>> = EQUAL_WEIGHTS): FamilyScore {
  const weights = normalizeWeights(rawWeights);
  const scores = Object.fromEntries(
    CRITERION_KEYS.map((k) => [k, family.scores[k]?.score ?? null]),
  ) as Record<CriterionKey, number | null>;
  const missing = CRITERION_KEYS.filter((k) => scores[k] === null);
  let overall: number | null = null;
  if (missing.length === 0) {
    overall = CRITERION_KEYS.reduce((sum, k) => sum + (scores[k] as number) * weights[k], 0);
  }
  return {
    familyId: family.id,
    name: family.name,
    scores,
    overall,
    overallDisplay: overall === null ? null : overall.toFixed(1),
    completeness: (CRITERION_KEYS.length - missing.length) / CRITERION_KEYS.length,
    missing,
  };
}

export type RankedFamily = FamilyScore & {
  /** Competition rank: tied exact scores share a rank and the next rank is skipped. Null when unranked. */
  rank: number | null;
  /** Display rank with '=' for ties, e.g. "=2". */
  rankDisplay: string;
};

const EPSILON = 1e-9;

/** Two exact scores are tied when they differ only by floating-point noise. */
export function sameScore(a: number, b: number): boolean {
  return Math.abs(a - b) < EPSILON;
}

/**
 * Competition ranking ("1, =2, =2, 4"): equal values share the best rank and the next
 * rank is skipped. Input must already be sorted descending.
 */
function competitionRanks(values: number[]): { rank: number; tied: boolean }[] {
  return values.map((v, i) => {
    const rank = i > 0 && sameScore(values[i - 1]!, v) ? runStartRank(values, i) : i + 1;
    const tied = values.some((o, j) => j !== i && sameScore(o, v));
    return { rank, tied };
  });
}

function runStartRank(values: number[], i: number): number {
  // Walk back to the first index holding the same value; that index + 1 is the shared rank.
  let j = i;
  while (j > 0 && sameScore(values[j - 1]!, values[i]!)) j -= 1;
  return j + 1;
}

/**
 * Rank families by exact weighted overall score (descending). Families with incomplete
 * research are listed after ranked families and are not given a rank.
 */
export function rankFamilies(families: Family[], weights: Partial<Record<CriterionKey, number>> = EQUAL_WEIGHTS): RankedFamily[] {
  const scored = families.map((f) => scoreFamily(f, weights));
  const ranked = scored
    .filter((s): s is FamilyScore & { overall: number } => s.overall !== null)
    .sort((a, b) => b.overall - a.overall || a.name.localeCompare(b.name));
  const unranked = scored
    .filter((s) => s.overall === null)
    .sort((a, b) => a.name.localeCompare(b.name));

  const ranks = competitionRanks(ranked.map((r) => r.overall));
  const out: RankedFamily[] = ranked.map((item, i) => {
    const { rank, tied } = ranks[i]!;
    return { ...item, rank, rankDisplay: tied ? `=${rank}` : String(rank) };
  });
  for (const item of unranked) {
    out.push({ ...item, rank: null, rankDisplay: '\u2014' });
  }
  return out;
}

export type CriterionRankedFamily = {
  familyId: string;
  name: string;
  score: number | null;
  rank: number | null;
  rankDisplay: string;
};

/**
 * Rank families by a single criterion (no weighting). Ties share rank with '=' notation.
 * Families without research for that criterion are unranked, never ranked as zero.
 */
export function rankByCriterion(families: Family[], key: CriterionKey): CriterionRankedFamily[] {
  const items = families.map((f) => ({ familyId: f.id, name: f.name, score: f.scores[key]?.score ?? null }));
  const ranked = items
    .filter((i): i is { familyId: string; name: string; score: number } => i.score !== null)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const ranks = competitionRanks(ranked.map((r) => r.score));
  const out: CriterionRankedFamily[] = ranked.map((item, i) => {
    const { rank, tied } = ranks[i]!;
    return { ...item, rank, rankDisplay: tied ? `=${rank}` : String(rank) };
  });
  for (const item of items.filter((i) => i.score === null)) {
    out.push({ ...item, rank: null, rankDisplay: '\u2014' });
  }
  return out;
}

/** Human label for a 0-4 score, or a placeholder for missing research. */
export function scoreLabel(score: number | null): string {
  if (score === null) return 'Research missing';
  return `${score} \u2013 ${SCORE_LABELS[score as 0 | 1 | 2 | 3 | 4]}`;
}
