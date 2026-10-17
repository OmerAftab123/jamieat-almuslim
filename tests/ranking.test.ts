import { describe, expect, it } from 'vitest';
import { getDataset } from '@/lib/data';
import { rankProgrammes } from '@/lib/ranking';

const d = getDataset();
const MIT = 'massachusetts-institute-technology-mit';

describe('rankProgrammes', () => {
  it('orders MIT verified programmes by unrounded equal-weight mean, highest first', () => {
    const rows = rankProgrammes(d, MIT);
    expect(rows.length).toBe(22);
    for (let i = 1; i < rows.length; i++) expect(rows[i - 1]!.overall).toBeGreaterThanOrEqual(rows[i]!.overall);
  });

  it('shares a rank between ties (competition ranking)', () => {
    const rows = rankProgrammes(d, MIT);
    const first = rows[0]!;
    const tied = rows.filter((r) => r.overall === first.overall);
    expect(tied.every((r) => r.rank === 1)).toBe(true);
    const next = rows.find((r) => r.overall < first.overall);
    expect(next && next.rank).toBe(tied.length + 1);
  });

  it('returns nothing for a university without verified programmes', () => {
    expect(rankProgrammes(d, 'imperial-college-london')).toEqual([]);
  });

  it('equal-weights the seven criteria', () => {
    const top = rankProgrammes(d, MIT)[0]!;
    const fam = d.families.find((f) => f.name === top.familyName)!;
    const mean = Object.values(fam.scores).reduce((a, s) => a + s.score, 0) / 7;
    expect(top.overall).toBeCloseTo(mean, 10);
  });
});
