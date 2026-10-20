import { useNavigate } from 'react-router-dom';
import { useAccounts } from '../../context/AccountsContext';
import { useAsync } from '../../hooks/useAsync';
import * as branchApi from '../../services/branchApi';
import CreateAccountForm from '../../components/forms/CreateAccountForm';
import { ErrorState, LoadingState } from '../../components/ui/States';

export default function CreateAccountPage() {
  const { refresh } = useAccounts();
  const navigate = useNavigate();
  const branches = useAsync(() => branchApi.listBranches(), []);

  async function created() {
    await refresh();
    navigate('/customer/dashboard');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Open an account</h1>
      {branches.loading ? <LoadingState label="Loading branches…" />
        : branches.error ? <ErrorState message={branches.error} onRetry={branches.reload} />
        : <CreateAccountForm branches={branches.data || []} onCreated={created} />}
    </div>
  );
}
