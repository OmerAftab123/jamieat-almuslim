import type { FxFile } from '@/lib/schemas';
import { convertFromUsd, convertWithUserRate, type CurrencyConversion } from '@/lib/costs';

/**
 * Display-currency choice shared by the cost calculator and the compare page.
 * 'USD' is the base. Any other stored code uses its dated rate from data/fx.json.
 * 'OTHER' uses a rate the user types in; it is never presented as verified.
 */
export const OTHER_CURRENCY = 'OTHER';

export type CurrencySelection = {
  choice: string; // 'USD' | a quote code from data/fx.json | 'OTHER'
  customCode: string; // used when choice === 'OTHER'
  customRate: string; // typed text, units of customCode per 1 USD
};

export type DisplayAmount =
  | { ok: true; currency: string; amount: number; conversion: CurrencyConversion | null }
  | { ok: false; error: string };

export function currencyOptions(fx: FxFile): { value: string; label: string }[] {
  return [
    { value: 'USD', label: 'US dollars (USD), the base currency' },
    ...fx.rates.map((r) => ({ value: r.quote, label: `${r.label} (${r.quote}), stored rate ${r.rateDate}` })),
    { value: OTHER_CURRENCY, label: 'Other currency: enter my own rate (not verified)' },
  ];
}

/** Convert a USD amount for the current selection. Invalid custom input returns an error instead of a number. */
export function convertForSelection(amountUsd: number, fx: FxFile, sel: CurrencySelection): DisplayAmount {
  if (sel.choice === 'USD') return { ok: true, currency: 'USD', amount: amountUsd, conversion: null };
  if (sel.choice === OTHER_CURRENCY) {
    const code = sel.customCode.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(code)) return { ok: false, error: 'Enter a three-letter currency code, for example EGP or BDT.' };
    const rate = sel.customRate.trim() === '' ? NaN : Number(sel.customRate);
    if (!Number.isFinite(rate) || rate <= 0) {
      return { ok: false, error: `Enter how many ${code} equal one US dollar, as a positive number.` };
    }
    const conversion = convertWithUserRate(amountUsd, code, rate);
    return { ok: true, currency: code, amount: conversion.amount, conversion };
  }
  const stored = fx.rates.find((r) => r.quote === sel.choice);
  if (!stored) return { ok: false, error: 'Unknown currency selected.' };
  const conversion = convertFromUsd(amountUsd, stored);
  return { ok: true, currency: stored.quote, amount: conversion.amount, conversion };
}
