import { describe, expect, it } from 'vitest';
import { checkIntegrity, findDuplicateDegreeNames, findDuplicateUniversityNames, getDataset } from '@/lib/data';

const d = getDataset();

describe('dataset integrity', () => {
  it('has no integrity problems across files', () => {
    expect(checkIntegrity(d)).toEqual([]);
  });

  it('has no duplicate degree or university names', () => {
    expect(findDuplicateDegreeNames(d.degrees)).toEqual([]);
    expect(findDuplicateUniversityNames(d.universities)).toEqual([]);
  });

  it('keeps QS ties consistent with the rank display', () => {
    for (const u of d.universities) {
      expect(u.qsRank.display.startsWith('=')).toBe(u.qsRank.tied);
    }
  });

  it('states the QS coverage as ranks 1-150 with 151 and below outside the dataset', () => {
    expect(d.meta.universitiesCoverage.rankRangeTranscribed).toMatch(/1-150/);
    expect(d.meta.universitiesCoverage.rankRangePending).toMatch(/151/);
    expect(d.universities).toHaveLength(150);
  });

  it('only cites source ids that exist', () => {
    const ids = new Set(d.sources.map((s) => s.id));
    for (const f of d.families) for (const s of f.sources) expect(ids.has(s)).toBe(true);
    for (const u of d.universities) expect(ids.has(u.qsSourceId)).toBe(true);
  });
});
