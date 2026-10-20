const TONES = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300',
  BLOCKED: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  CLOSED: 'bg-slate-200 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300',
  Credit: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300',
  Debit: 'bg-slate-200 text-slate-800 dark:bg-slate-700/50 dark:text-slate-200',
  Transfer: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300',
  ADMIN: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300',
  CUSTOMER: 'bg-slate-200 text-slate-800 dark:bg-slate-700/50 dark:text-slate-200',
};

export default function StatusBadge({ label }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[label] || TONES.CLOSED}`}>
      {label}
    </span>
  );
}
