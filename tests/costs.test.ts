import { describe, expect, it } from 'vitest';
import { computeCosts, usdToPkr, type CostInput } from '@/lib/costs';

const base: CostInput = {
  annualTuition: 20000,
  annualFees: 1000,
  annualLiving: 10000,
  annualOther: 1000,
  oneTimeCosts: 2000,
  durationYears: 4,
  annualScholarship: 0,
};

describe('computeCosts', () => {
  it('sums annual gross and total gross with one-time costs', () => {
    const r = computeCosts(base);
    expect(r.annualGross).toBe(32000);
    expect(r.totalGross).toBe(32000 * 4 + 2000);
    expect(r.totalOutOfPocket).toBe(r.totalNet);
  });

  it('applies a scholarship to annual costs only, never to one-time costs', () => {
    const r = computeCosts({ ...base, annualScholarship: 10000 });
    expect(r.annualScholarshipApplied).toBe(10000);
    expect(r.annualNet).toBe(22000);
    expect(r.totalNet).toBe(22000 * 4 + 2000);
  });

  it('caps the applied scholarship at the annual gross cost and reports the unused remainder', () => {
    const r = computeCosts({ ...base, annualScholarship: 50000 });
    expect(r.annualScholarshipApplied).toBe(32000);
    expect(r.annualNet).toBe(0);
    expect(r.annualScholarshipUnused).toBe(18000);
    expect(r.totalNet).toBe(2000);
  });

  it('treats a full cost-of-attendance grant as covering annual gross only', () => {
    const r = computeCosts({ ...base, annualScholarship: 32000 });
    expect(r.annualNet).toBe(0);
    expect(r.totalOutOfPocket).toBe(2000);
  });

  it('rejects negative, non-finite and out-of-range inputs', () => {
    expect(() => computeCosts({ ...base, annualTuition: -1 })).toThrow(RangeError);
    expect(() => computeCosts({ ...base, annualFees: Number.NaN })).toThrow(RangeError);
    expect(() => computeCosts({ ...base, durationYears: 0 })).toThrow(RangeError);
    expect(() => computeCosts({ ...base, durationYears: 11 })).toThrow(RangeError);
  });
});

describe('usdToPkr', () => {
  it('converts with the supplied rate and keeps its date and source', () => {
    const c = usdToPkr(100, { rate: 276.9545, rateType: 'M2M', rateDate: '2026-10-14', sourceUrl: 'https://example.org', sourceId: 's', note: 'n' });
    expect(c.amountPkr).toBeCloseTo(27695.45, 4);
    expect(c.rateDate).toBe('2026-10-14');
    expect(c.sourceId).toBe('s');
  });
});
