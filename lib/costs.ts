/**
 * Deterministic cost model. All inputs are user-entered or sourced amounts in one currency
 * (USD by default). Nothing here is an estimate of its own: every figure traces to an input.
 */

export type CostInput = {
  /** Annual tuition, in the chosen currency. */
  annualTuition: number;
  /** Annual mandatory fees. */
  annualFees: number;
  /** Annual accommodation and meals. */
  annualLiving: number;
  /** Annual health insurance and other recurring costs. */
  annualOther: number;
  /** One-time costs: travel, visa, relocation, equipment and initial deposits. */
  oneTimeCosts: number;
  /** Programme length in years (e.g. 4). Must be > 0 and at most 10. */
  durationYears: number;
  /** Annual gross scholarship value that applies to annual costs. Never applies to one-time costs. */
  annualScholarship: number;
};

export type CostResult = {
  annualGross: number;
  annualScholarshipApplied: number;
  /** Scholarship value above annual gross cost. It is not transferable and is reported separately. */
  annualScholarshipUnused: number;
  annualNet: number;
  totalGross: number;
  totalNet: number;
  /** Total that is not covered by awards, including one-time costs. */
  totalOutOfPocket: number;
};

export const MAX_DURATION_YEARS = 10;

export function assertNonNegative(name: string, v: number): void {
  if (!Number.isFinite(v) || v < 0) {
    throw new RangeError(`${name} must be a number greater than or equal to 0.`);
  }
}

/** Compute annual and total costs. Throws RangeError for invalid input. */
export function computeCosts(input: CostInput): CostResult {
  assertNonNegative('Annual tuition', input.annualTuition);
  assertNonNegative('Annual fees', input.annualFees);
  assertNonNegative('Annual living costs', input.annualLiving);
  assertNonNegative('Annual other costs', input.annualOther);
  assertNonNegative('One-time costs', input.oneTimeCosts);
  assertNonNegative('Annual scholarship', input.annualScholarship);
  if (!Number.isFinite(input.durationYears) || input.durationYears <= 0 || input.durationYears > MAX_DURATION_YEARS) {
    throw new RangeError(`Programme length must be greater than 0 and no more than ${MAX_DURATION_YEARS} years.`);
  }

  const annualGross = input.annualTuition + input.annualFees + input.annualLiving + input.annualOther;
  const annualScholarshipApplied = Math.min(input.annualScholarship, annualGross);
  const annualScholarshipUnused = input.annualScholarship - annualScholarshipApplied;
  const annualNet = annualGross - annualScholarshipApplied;
  const totalGross = annualGross * input.durationYears + input.oneTimeCosts;
  const totalNet = annualNet * input.durationYears + input.oneTimeCosts;
  return {
    annualGross,
    annualScholarshipApplied,
    annualScholarshipUnused,
    annualNet,
    totalGross,
    totalNet,
    totalOutOfPocket: totalNet,
  };
}

export type CurrencyConversion = {
  amountPkr: number;
  rate: number;
  rateType: string;
  rateDate: string;
  sourceUrl: string;
  sourceId: string;
  note: string;
};

/** Convert a USD amount to PKR with the dated rate from data/fx.json. Shows its source and date. */
export function usdToPkr(amountUsd: number, fx: { rate: number; rateType: string; rateDate: string; sourceUrl: string; sourceId: string; note: string }): CurrencyConversion {
  return {
    amountPkr: amountUsd * fx.rate,
    rate: fx.rate,
    rateType: fx.rateType,
    rateDate: fx.rateDate,
    sourceUrl: fx.sourceUrl,
    sourceId: fx.sourceId,
    note: fx.note,
  };
}

/** Format a number as a whole-unit currency string without inventing precision. */
export function formatMoney(amount: number, currency: 'USD' | 'PKR'): string {
  const locale = currency === 'PKR' ? 'en-PK' : 'en-US';
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}
