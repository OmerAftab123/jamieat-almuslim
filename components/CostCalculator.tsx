'use client';

import { useMemo, useState } from 'react';
import { computeCosts, formatMoney, usdToPkr, type CostInput } from '@/lib/costs';
import type { FxRate } from '@/lib/schemas';

type Field = Exclude<keyof CostInput, 'durationYears'>;

const FIELDS: Array<{ key: Field; label: string; hint: string }> = [
  { key: 'annualTuition', label: 'Annual tuition', hint: 'From the official fees page.' },
  { key: 'annualFees', label: 'Annual mandatory fees', hint: 'Student services, health, etc.' },
  { key: 'annualLiving', label: 'Annual accommodation and meals', hint: 'Your own estimate or official cost-of-living figure.' },
  { key: 'annualOther', label: 'Other recurring costs per year', hint: 'Books, insurance, personal costs.' },
  { key: 'oneTimeCosts', label: 'One-time costs', hint: 'Flights, visa, deposits, relocation.' },
  { key: 'annualScholarship', label: 'Annual award value (grants only)', hint: 'Enter only confirmed grants. Loans are not scholarships.' },
];

/**
 * Calculator for a student's own inputs. Pre-filled with zeros: no amount is assumed.
 * Results are sums of what you enter; they are not official costs.
 */
export function CostCalculator({ fx }: { fx: FxRate }) {
  const [values, setValues] = useState<Record<Field, string>>({
    annualTuition: '',
    annualFees: '',
    annualLiving: '',
    annualOther: '',
    oneTimeCosts: '',
    annualScholarship: '',
  });
  const [duration, setDuration] = useState('4');

  const parsed = useMemo(() => {
    const input = {} as Record<Field, number>;
    for (const f of FIELDS) {
      const raw = values[f.key].trim();
      const n = raw === '' ? 0 : Number(raw);
      input[f.key] = Number.isFinite(n) ? n : Number.NaN;
    }
    return input;
  }, [values]);

  const durationNum = Number(duration);
  const anyInvalid = Object.values(parsed).some((n) => Number.isNaN(n) || n < 0) || !Number.isFinite(durationNum);
  let result: ReturnType<typeof computeCosts> | null = null;
  let error: string | null = null;
  if (anyInvalid) {
    error = 'Enter amounts as numbers of zero or more.';
  } else {
    try {
      result = computeCosts({ ...parsed, durationYears: durationNum } as CostInput);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Invalid input.';
    }
  }

  const pkr = result ? usdToPkr(result.totalNet, fx) : null;
  const pkrAnnual = result ? usdToPkr(result.annualNet, fx) : null;

  return (
    <section className="panel" aria-labelledby="calc-h">
      <h3 id="calc-h" style={{ marginTop: 0 }}>
        Your own cost estimate
      </h3>
      <p className="small muted">
        Enter your own figures in <strong>USD</strong>. Nothing is pre-filled. A total is only as good as the inputs.
        Scholarships reduce annual costs only, up to the annual gross cost, and never one-time costs.
      </p>
      <div className="form-grid">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label htmlFor={`c-${f.key}`}>
              {f.label} (USD)
              <span className="hint">{f.hint}</span>
            </label>
            <input
              id={`c-${f.key}`}
              type="text"
              inputMode="decimal"
              value={values[f.key]}
              onChange={(e) => setValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
              placeholder="0"
            />
          </div>
        ))}
        <div>
          <label htmlFor="c-duration">Programme length (years)</label>
          <input id="c-duration" type="number" min={1} max={10} step={1} value={duration} onChange={(e) => setDuration(e.target.value)} />
        </div>
      </div>
      {error ? (
        <p className="notice bad" role="alert">
          {error}
        </p>
      ) : result && pkr && pkrAnnual ? (
        <div aria-live="polite">
          <table>
            <caption className="small muted" style={{ textAlign: 'left' }}>
              Totals from your inputs. Not an official cost of attendance.
            </caption>
            <tbody>
              <tr>
                <th scope="row">Annual gross cost</th>
                <td className="num">{formatMoney(result.annualGross, 'USD')}</td>
              </tr>
              <tr>
                <th scope="row">Annual award applied</th>
                <td className="num">{formatMoney(result.annualScholarshipApplied, 'USD')}</td>
              </tr>
              {result.annualScholarshipUnused > 0 ? (
                <tr>
                  <th scope="row">Award above annual cost (not applied)</th>
                  <td className="num">{formatMoney(result.annualScholarshipUnused, 'USD')}</td>
                </tr>
              ) : null}
              <tr>
                <th scope="row">Annual net cost</th>
                <td className="num">{formatMoney(result.annualNet, 'USD')}</td>
              </tr>
              <tr>
                <th scope="row">Total gross (all years plus one-time)</th>
                <td className="num">{formatMoney(result.totalGross, 'USD')}</td>
              </tr>
              <tr>
                <th scope="row">Total out of pocket (net)</th>
                <td className="num">
                  <strong>{formatMoney(result.totalOutOfPocket, 'USD')}</strong>
                </td>
              </tr>
              <tr>
                <th scope="row">Total out of pocket in PKR</th>
                <td className="num">
                  <strong>{formatMoney(pkr.amountPkr, 'PKR')}</strong>
                </td>
              </tr>
              <tr>
                <th scope="row">Annual net in PKR</th>
                <td className="num">{formatMoney(pkrAnnual.amountPkr, 'PKR')}</td>
              </tr>
            </tbody>
          </table>
          <p className="small muted">
            PKR conversion uses {fx.rate} PKR per USD ({fx.rateType}, dated {fx.rateDate}, source:{' '}
            <a href={fx.sourceUrl} target="_blank" rel="noopener noreferrer">
              State Bank of Pakistan
            </a>
            ). {fx.note} Exchange rates change; re-check before you plan.
          </p>
        </div>
      ) : null}
    </section>
  );
}
