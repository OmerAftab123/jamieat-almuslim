import { describe, expect, it } from 'vitest';
import type { Family } from '@/lib/schemas';
import { CRITERION_KEYS, EQUAL_WEIGHTS, normalizeWeights, rankByCriterion, rankFamilies, scoreFamily } from '@/lib/scoring';

function fam(id: string, name: string, scores: Partial<Record<(typeof CRITERION_KEYS)[number], number | null>>): Family {
  const base = Object.fromEntries(
    CRITERION_KEYS.map((k) => [
      k,
      { score: scores[k] ?? 2, rationale: 'Test rationale that is long enough to pass validation.' },
    ]),
  );
  for (const k of CRITERION_KEYS) {
    if (scores[k] === null) (base as Record<string, unknown>)[k] = { score: null, rationale: 'missing in test data' };
  }
  return {
    id,
    name,
    description: 'test',
    pathways: ['test'],
    scores: base as Family['scores'],
    confidence: 'low',
    sources: [],
    assumptions: [],
    changeFactors: [],
    additionalQualifications: null,
  } as unknown as Family;
}

const uniform = (v: number) => Object.fromEntries(CRITERION_KEYS.map((k) => [k, v]));

describe('normalizeWeights', () => {
  it('scales weights to sum to exactly 1', () => {
    const w = normalizeWeights({ ...uniform(0), islamic: 2, benefit: 2 });
    expect(w.islamic).toBeCloseTo(0.5);
    expect(w.benefit).toBeCloseTo(0.5);
    const total = CRITERION_KEYS.reduce((s, k) => s + w[k], 0);
    expect(total).toBeCloseTo(1, 12);
  });

  it('gives equal weights of 1/7 by default', () => {
    const w = normalizeWeights(EQUAL_WEIGHTS);
    for (const k of CRITERION_KEYS) expect(w[k]).toBeCloseTo(1 / 7, 12);
  });

  it('rejects all-zero weights', () => {
    expect(() => normalizeWeights(uniform(0))).toThrow(RangeError);
  });

  it('rejects negative and non-finite weights', () => {
    expect(() => normalizeWeights({ ...EQUAL_WEIGHTS, islamic: -1 })).toThrow(RangeError);
    expect(() => normalizeWeights({ ...EQUAL_WEIGHTS, islamic: Number.NaN })).toThrow(RangeError);
  });
});

describe('scoreFamily', () => {
  it('computes the equal-weight mean of seven scores', () => {
    const f = fam('a', 'A', { islamic: 4, benefit: 4, financial: 2, futureResilience: 2, aiResilience: 2, employmentStability: 2, flexibility: 2 });
    const s = scoreFamily(f);
    expect(s.overall).toBeCloseTo(18 / 7, 12);
    expect(s.overallDisplay).toBe((18 / 7).toFixed(1));
  });

  it('never treats a missing criterion as zero: overall is null and completeness drops', () => {
    const f = fam('b', 'B', { flexibility: null });
    const s = scoreFamily(f);
    expect(s.scores.flexibility).toBeNull();
    expect(s.overall).toBeNull();
    expect(s.overallDisplay).toBeNull();
    expect(s.missing).toEqual(['flexibility']);
    expect(s.completeness).toBeCloseTo(6 / 7, 12);
  });

  it('keeps the unrounded value for ordering and rounds only for display', () => {
    const f = fam('c', 'C', { islamic: 3, benefit: 3, financial: 3, futureResilience: 3, aiResilience: 3, employmentStability: 3, flexibility: 2 });
    const s = scoreFamily(f);
    expect(s.overall).toBeCloseTo(20 / 7, 12);
    expect(s.overallDisplay).toBe('2.9');
  });

  it('applies custom weights', () => {
    const f = fam('d', 'D', { islamic: 4, benefit: 0, financial: 0, futureResilience: 0, aiResilience: 0, employmentStability: 0, flexibility: 0 });
    const s = scoreFamily(f, { ...uniform(0), islamic: 1 });
    expect(s.overall).toBeCloseTo(4, 12);
  });
});

describe('rankFamilies', () => {
  const a = fam('a', 'Alpha', uniform(4));
  const b = fam('b', 'Bravo', uniform(3));
  const c = fam('c', 'Charlie', uniform(3));
  const d = fam('d', 'Delta', uniform(2));
  const incomplete = fam('e', 'Echo', { flexibility: null });

  it('uses competition ranking: tied values share a rank and the next rank is skipped', () => {
    const ranked = rankFamilies([d, c, a, b]);
    expect(ranked.map((r) => [r.name, r.rankDisplay])).toEqual([
      ['Alpha', '1'],
      ['Bravo', '=2'],
      ['Charlie', '=2'],
      ['Delta', '4'],
    ]);
  });

  it('lists families with missing research last, unranked', () => {
    const ranked = rankFamilies([incomplete, a]);
    expect(ranked[0]?.name).toBe('Alpha');
    expect(ranked[1]).toMatchObject({ name: 'Echo', rank: null, rankDisplay: '\u2014', overall: null });
  });

  it('changes the order when weights change', () => {
    const x = fam('x', 'X', { islamic: 4, benefit: 0, financial: 4, futureResilience: 4, aiResilience: 4, employmentStability: 4, flexibility: 4 });
    const y = fam('y', 'Y', { islamic: 0, benefit: 4, financial: 3, futureResilience: 3, aiResilience: 3, employmentStability: 3, flexibility: 3 });
    expect(rankFamilies([x, y])[0]?.name).toBe('X');
    const islamicOnly = { ...uniform(0), islamic: 1 };
    expect(rankFamilies([x, y], islamicOnly)[0]?.name).toBe('X');
    const benefitOnly = { ...uniform(0), benefit: 1 };
    expect(rankFamilies([x, y], benefitOnly)[0]?.name).toBe('Y');
  });
});

describe('rankByCriterion', () => {
  it('ranks on one criterion and leaves missing values unranked', () => {
    const rows = rankByCriterion(
      [fam('a', 'A', { financial: 4 }), fam('b', 'B', { financial: 4 }), fam('c', 'C', { financial: 1 }), fam('d', 'D', { financial: null })],
      'financial',
    );
    expect(rows.map((r) => r.rankDisplay)).toEqual(['=1', '=1', '3', '\u2014']);
  });
});

describe('real dataset scoring', () => {
  it('every family has all seven criteria scored 0 to 4 with rationale', async () => {
    const { getDataset } = await import('@/lib/data');
    const d = getDataset();
    for (const f of d.families) {
      for (const k of CRITERION_KEYS) {
        const s = f.scores[k].score;
        expect(Number.isInteger(s) && s >= 0 && s <= 4, `${f.id}.${k}`).toBe(true);
      }
    }
  });
});
