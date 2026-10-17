'use client';

import type { FxFile } from '@/lib/schemas';
import { currencyOptions, OTHER_CURRENCY, type CurrencySelection } from '@/lib/currency';

export function CurrencyChooser({
  fx,
  value,
  onChange,
  idPrefix,
}: {
  fx: FxFile;
  value: CurrencySelection;
  onChange: (next: CurrencySelection) => void;
  idPrefix: string;
}) {
  return (
    <div className="form-grid">
      <div>
        <label htmlFor={`${idPrefix}-cur`}>Show amounts in</label>
        <select
          id={`${idPrefix}-cur`}
          value={value.choice}
          onChange={(e) => onChange({ ...value, choice: e.target.value })}
        >
          {currencyOptions(fx).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="hint">Universities publish costs in USD. Other currencies are conversions, not official prices.</span>
      </div>
      {value.choice === OTHER_CURRENCY ? (
        <>
          <div>
            <label htmlFor={`${idPrefix}-code`}>Your currency code</label>
            <input
              id={`${idPrefix}-code`}
              value={value.customCode}
              maxLength={3}
              placeholder="e.g. BDT"
              onChange={(e) => onChange({ ...value, customCode: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor={`${idPrefix}-rate`}>How many of them equal 1 US dollar?</label>
            <input
              id={`${idPrefix}-rate`}
              inputMode="decimal"
              value={value.customRate}
              placeholder="e.g. 122.5"
              onChange={(e) => onChange({ ...value, customRate: e.target.value })}
            />
            <span className="hint">Your own rate. It is not checked against an official source.</span>
          </div>
        </>
      ) : null}
    </div>
  );
}
