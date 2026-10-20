import { Link } from 'react-router-dom';
import { useAccounts } from '../../context/AccountsContext';
import { useAsync } from '../../hooks/useAsync';
import * as transactionApi from '../../services/transactionApi';
import AccountSwitcher from '../../components/banking/AccountSwitcher';
import AccountSummary from '../../components/banking/AccountSummary';
import TransactionTable from '../../components/banking/TransactionTable';
import DepositForm from '../../components/forms/DepositForm';
import TransferForm from '../../components/forms/TransferForm';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States';

export default function CustomerDashboard() {
  const { accounts, selected, select, loading, error, refresh, version } = useAccounts();
  const number = selected ? selected.accountNumber : null;
  const history = useAsync(() => (number ? transactionApi.history(number) : Promise.resolve([])), [number, version]);

  if (loading && !accounts.length) return <LoadingState label="Loading your accounts…" />;
  if (error && !accounts.length) return <ErrorState message={error} onRetry={refresh} />;
  if (!selected) {
    return (
      <div className="card">
        <EmptyState title="You don't have an account yet">
          Open your first Banko account to start depositing and transferring money.
          <div className="mt-4"><Link to="/customer/accounts/new" className="btn btn-primary">Open an account</Link></div>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Your accounts</h1>
      <AccountSwitcher accounts={accounts} selected={selected} onSelect={select} />
      <AccountSummary key={number} account={selected} />
      <div className="grid gap-6 lg:grid-cols-2">
        <DepositForm key={`d-${number}`} account={selected} onDone={refresh} />
        <TransferForm key={`t-${number}`} account={selected} onDone={refresh} />
      </div>
      <section className="card">
        <div className="flex items-center justify-between px-4 py-4">
          <h2 className="text-lg font-bold">Recent activity</h2>
          <Link to="/customer/transactions" className="text-sm font-semibold text-indigo-600 underline dark:text-indigo-400">See all</Link>
        </div>
        {history.loading ? <LoadingState label="Loading activity…" />
          : history.error ? <ErrorState message={history.error} onRetry={history.reload} />
          : <TransactionTable rows={history.data || []} limit={5} />}
      </section>
    </div>
  );
}
