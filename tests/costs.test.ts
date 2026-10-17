import { describe, expect, it } from 'vitest';
import { computeCosts, convertFromUsd, convertWithUserRate, formatMoney, type CostInput } from '@/lib/costs';
import { convertForSelection, currencyOptions } from '@/lib/currency';
import type { FxFile } from '@/lib/schemas';

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

describe('convertFromUsd', () => {
  it('converts with the supplied rate and keeps its date and source', () => {
    const c = convertFromUsd(100, { quote: 'PKR', rate: 276.9545, rateType: 'M2M', rateDate: '2026-10-14', sourceUrl: 'https://example.org', sourceId: 's', note: 'n' });
    expect(c.amount).toBeCloseTo(27695.45, 4);
    expect(c.currency).toBe('PKR');
    expect(c.rateDate).toBe('2026-10-14');
    expect(c.sourceId).toBe('s');
    expect(c.userSupplied).toBe(false);
  });
});

describe('convertWithUserRate', () => {
  it('is always labelled as user-supplied and unverified', () => {
    const c = convertWithUserRate(1000, 'BDT', 122.5);
    expect(c.amount).toBe(122500);
    expect(c.userSupplied).toBe(true);
    expect(c.sourceId).toBeNull();
    expect(c.rateType).toMatch(/not verified/);
  });
});

describe('formatMoney', () => {
  it('falls back to a plain number for an unknown currency code', () => {
    const out = formatMoney(1234.4, 'XYZ');
    expect(out).toContain('XYZ');
    expect(out).toContain('1,234');
  });
});

const fxFixture: FxFile = {
  base: 'USD',
  datasetVersion: 'test',
  note: 'n',
  rates: [
    { quote: 'PKR', label: 'Pakistani rupee', rate: 280, rateType: 't', rateDate: '2026-01-01', sourceId: 's', sourceUrl: 'https://example.org', retrievedVia: 'r', note: 'n' },
    { quote: 'EUR', label: 'Euro', rate: 0.9, rateType: 't', rateDate: '2026-01-02', sourceId: 's', sourceUrl: 'https://example.org', retrievedVia: 'r', note: 'n' },
  ],
};

describe('convertForSelection', () => {
  it('returns USD unchanged with no conversion record', () => {
    const r = convertForSelection(500, fxFixture, { choice: 'USD', customCode: '', customRate: '' });
    expect(r).toEqual({ ok: true, currency: 'USD', amount: 500, conversion: null });
  });

  it('uses the stored rate for a sourced currency', () => {
    const r = convertForSelection(100, fxFixture, { choice: 'EUR', customCode: '', customRate: '' });
    expect(r.ok && r.amount).toBeCloseTo(90, 6);
    expect(r.ok && r.conversion?.userSupplied).toBe(false);
  });

  it('rejects an invalid custom code or rate instead of producing a number', () => {
    expect(convertForSelection(100, fxFixture, { choice: 'OTHER', customCode: 'bd', customRate: '120' }).ok).toBe(false);
    expect(convertForSelection(100, fxFixture, { choice: 'OTHER', customCode: 'BDT', customRate: '' }).ok).toBe(false);
    expect(convertForSelection(100, fxFixture, { choice: 'OTHER', customCode: 'BDT', customRate: '-3' }).ok).toBe(false);
  });

  it('accepts a valid custom rate and marks it unverified', () => {
    const r = convertForSelection(100, fxFixture, { choice: 'OTHER', customCode: 'bdt', customRate: '120' });
    expect(r.ok && r.currency).toBe('BDT');
    expect(r.ok && r.amount).toBe(12000);
    expect(r.ok && r.conversion?.userSupplied).toBe(true);
  });

  it('lists USD, every stored currency and the custom option', () => {
    expect(currencyOptions(fxFixture).map((o) => o.value)).toEqual(['USD', 'PKR', 'EUR', 'OTHER']);
  });
});
