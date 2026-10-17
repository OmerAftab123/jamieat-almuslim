'use client';

import { useMemo, useState } from 'react';
import { computeCosts, formatMoney, type CostInput } from '@/lib/costs';
import type { FxFile } from '@/lib/schemas';
import { convertForSelection, type CurrencySelection } from '@/lib/currency';
import { CurrencyChooser } from '@/components/CurrencyChooser';

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
export function CostCalculator({ fx }: { fx: FxFile }) {
  const [cur, setCur] = useState<CurrencySelection>({ choice: 'USD', customCode: '', customRate: '' });
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

  const displayTotal = result ? convertForSelection(result.totalOutOfPocket, fx, cur) : null;
  const displayAnnual = result ? convertForSelection(result.annualNet, fx, cur) : null;
  const displayError = displayTotal && !displayTotal.ok ? displayTotal.error : null;
  const totalDisplay = displayTotal && displayTotal.ok ? displayTotal : null;
  const annualDisplay = displayAnnual && displayAnnual.ok ? displayAnnual : null;

  return (
    <section className="panel" aria-labelledby="calc-h">
      <h3 id="calc-h" style={{ marginTop: 0 }}>
        Your own cost estimate
      </h3>
      <p className="small muted">
        Enter your own figures in <strong>USD</strong>. Nothing is pre-filled. A total is only as good as the inputs.
        Scholarships reduce annual costs only, up to the annual gross cost, and never one-time costs.
      </p>
      <CurrencyChooser fx={fx} value={cur} onChange={setCur} idPrefix="calc" />
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
      {error || displayError ? (
        <p className="notice bad" role="alert">
          {error ?? displayError}
        </p>
      ) : result && totalDisplay && annualDisplay ? (
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
              {totalDisplay.currency !== 'USD' ? (
                <>
                  <tr>
                    <th scope="row">Total out of pocket in {totalDisplay.currency}</th>
                    <td className="num">
                      <strong>{formatMoney(totalDisplay.amount, totalDisplay.currency)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Annual net in {annualDisplay.currency}</th>
                    <td className="num">{formatMoney(annualDisplay.amount, annualDisplay.currency)}</td>
                  </tr>
                </>
              ) : null}
            </tbody>
          </table>
          {totalDisplay.conversion ? (
            <p className="small muted">
              {totalDisplay.currency} conversion uses {totalDisplay.conversion.rate} {totalDisplay.currency} per USD (
              {totalDisplay.conversion.rateType}, dated {totalDisplay.conversion.rateDate}
              {totalDisplay.conversion.sourceUrl ? (
                <>
                  , source:{' '}
                  <a href={totalDisplay.conversion.sourceUrl} target="_blank" rel="noopener noreferrer">
                    official page
                  </a>
                </>
              ) : null}
              ). {totalDisplay.conversion.note} Exchange rates change; re-check before you plan.
            </p>
          ) : (
            <p className="small muted">Amounts are in US dollars, the currency universities publish.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
