// The single place that decides how dates are displayed.
const formatter = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export function formatDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : formatter.format(d);
}
