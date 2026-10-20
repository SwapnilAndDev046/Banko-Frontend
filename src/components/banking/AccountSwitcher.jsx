import StatusBadge from '../ui/StatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';

// Account cards that act as a tab list. Selecting one updates balance and history together.
export default function AccountSwitcher({ accounts, selected, onSelect }) {
  return (
    <div role="tablist" aria-label="Your accounts" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {accounts.map((a) => {
        const active = selected && a.accountNumber === selected.accountNumber;
        return (
          <button
            key={a.accountNumber}
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(a.accountNumber)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              active
                ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-500/10'
                : 'border-slate-200 bg-white hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold tabular-nums">{a.accountNumber}</span>
              <StatusBadge label={a.status} />
            </div>
            <p className="mt-2 text-xl font-bold tabular-nums">{formatCurrency(a.balance)}</p>
          </button>
        );
      })}
    </div>
  );
}
