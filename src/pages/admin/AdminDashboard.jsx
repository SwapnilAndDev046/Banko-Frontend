import { Building2, CreditCard, Users } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import * as customerApi from '../../services/customerApi';
import * as accountApi from '../../services/accountApi';
import * as branchApi from '../../services/branchApi';
import StatCard from '../../components/ui/StatCard';
import { Alert, LoadingState } from '../../components/ui/States';

// Counts are derived from the list endpoints. The backend has no dashboard-summary endpoint.
export default function AdminDashboard() {
  const { loading, data } = useAsync(async () => {
    const [customers, accounts, branches] = await Promise.allSettled([
      customerApi.allCustomers(),
      accountApi.allAccounts(),
      branchApi.listBranches(),
    ]);
    return { customers, accounts, branches };
  }, []);

  if (loading && !data) return <LoadingState label="Loading summary…" />;
  const count = (r) => (r.status === 'fulfilled' && Array.isArray(r.value) ? r.value.length : 'Unavailable');
  const failed = Object.values(data).some((r) => r.status === 'rejected');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin dashboard</h1>
      {failed && <Alert tone="warning">Some totals could not be loaded. They show as “Unavailable”.</Alert>}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Customers" value={count(data.customers)} icon={Users} hint="Counted from the customer list" />
        <StatCard label="Accounts" value={count(data.accounts)} icon={CreditCard} hint="Counted from the account list" />
        <StatCard label="Branches" value={count(data.branches)} icon={Building2} hint="Counted from the branch list" />
      </div>
    </div>
  );
}
