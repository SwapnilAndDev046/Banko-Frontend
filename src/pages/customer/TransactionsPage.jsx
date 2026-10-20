import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccounts } from '../../context/AccountsContext';
import { useAsync } from '../../hooks/useAsync';
import * as transactionApi from '../../services/transactionApi';
import AccountSwitcher from '../../components/banking/AccountSwitcher';
import TransactionTable, { activityLabel } from '../../components/banking/TransactionTable';
import FormField from '../../components/ui/FormField';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States';

export default function TransactionsPage() {
  const { accounts, selected, select, loading, error, refresh, version } = useAccounts();
  const [filter, setFilter] = useState('All');
  const number = selected ? selected.accountNumber : null;
  const history = useAsync(() => (number ? transactionApi.history(number) : Promise.resolve([])), [number, version]);

  if (loading && !accounts.length) return <LoadingState label="Loading your accounts…" />;
  if (error && !accounts.length) return <ErrorState message={error} onRetry={refresh} />;
  if (!selected) {
    return (
      <div className="card">
        <EmptyState title="No accounts yet">
          <Link to="/customer/accounts/new" className="btn btn-primary mt-2">Open an account</Link>
        </EmptyState>
      </div>
    );
  }

  const rows = (history.data || []).filter((r) => filter === 'All' || activityLabel(r.transactionType) === filter);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transactions</h1>
      <AccountSwitcher accounts={accounts} selected={selected} onSelect={select} />
      <section className="card">
        <div className="flex flex-wrap items-end justify-between gap-3 p-4">
          <h2 className="text-lg font-bold">Activity for {selected.accountNumber}</h2>
          <div className="w-40">
            <FormField label="Show" id="activity-filter">
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option>All</option>
                <option>Credit</option>
                <option>Debit</option>
              </select>
            </FormField>
          </div>
        </div>
        {history.loading ? <LoadingState label="Loading activity…" />
          : history.error ? <ErrorState message={history.error} onRetry={history.reload} />
          : <TransactionTable rows={rows} />}
        <p className="muted border-t border-slate-200 px-4 py-3 text-xs dark:border-slate-800">
          Credit means money in; Debit means money out. The current history data does not say why money left an account, so transfers are not labelled separately.
        </p>
      </section>
    </div>
  );
}
