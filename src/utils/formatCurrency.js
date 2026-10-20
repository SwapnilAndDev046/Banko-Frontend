// The single place that decides how money is displayed.
// The backend DTOs have no currency field, so INR is a presentation default.
const CURRENCY = 'INR';
const LOCALE = 'en-IN';
const formatter = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY });

export function formatCurrency(value) {
  const n = Number(value);
  return Number.isFinite(n) ? formatter.format(n) : '—';
}
