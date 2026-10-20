import { useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import * as accountApi from '../../services/accountApi';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Alert, ErrorState, LoadingState } from '../../components/ui/States';
import { formatCurrency } from '../../utils/formatCurrency';

const BASE_COLUMNS = [
  { key: 'accountNumber', header: 'Account number' },
  { key: 'balance', header: 'Balance', align: 'right', render: (account) => formatCurrency(account.balance) },
  { key: 'status', header: 'Status', render: (account) => <StatusBadge label={account.status} /> },
  { key: 'customerId', header: 'Customer ID' },
  { key: 'branchId', header: 'Branch ID' },
];
const STATUSES = ['ACTIVE', 'BLOCKED', 'CLOSED'];

function AccountActions({ account, onDelete, onUpdated, busy, setBusy, setNotice }) {
  const [status, setStatus] = useState(account.status || 'ACTIVE');
  const changed = status !== account.status;

  async function saveStatus() {
    if (!changed || busy) return;
    setBusy(account.id);
    setNotice(null);
    try {
      await accountApi.updateAccountStatus(account.id, status);
      setNotice({ ok: true, message: `Account ${account.accountNumber} status updated.` });
      onUpdated();
    } catch (error) {
      setNotice({ ok: false, message: error.message });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex min-w-[220px] flex-wrap items-center gap-2">
      <select aria-label={`Status for ${account.accountNumber}`} className="input w-auto min-w-28" value={status} onChange={(event) => setStatus(event.target.value)} disabled={busy === account.id}>
        {STATUSES.map((value) => <option key={value} value={value}>{value}</option>)}
      </select>
      <Button type="button" variant="secondary" disabled={!changed || busy === account.id} loading={busy === account.id} onClick={saveStatus}>Update</Button>
      <Button type="button" variant="danger" onClick={() => onDelete(account)}>Delete</Button>
    </div>
  );
}

export default function AccountsPage() {
  const result = useAsync(() => accountApi.allAccounts(), []);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [statusBusyId, setStatusBusyId] = useState(null);
  const [notice, setNotice] = useState(null);
  const accounts = Array.isArray(result.data) ? result.data : [];
  const supportsIds = accounts.some((account) => account.id !== undefined && account.id !== null);
  const columns = supportsIds ? [...BASE_COLUMNS, {
    key: 'actions',
    header: 'Actions',
    render: (account) => account.id == null
      ? <span className="muted text-xs">ID unavailable</span>
      : <AccountActions
          account={account}
          busy={statusBusyId}
          setBusy={setStatusBusyId}
          setNotice={setNotice}
          onUpdated={result.reload}
          onDelete={(target) => { setNotice(null); setDeleteTarget(target); }}
        />,
  }] : BASE_COLUMNS;

  async function confirmDelete() {
    if (!deleteTarget || deleteBusy || deleteTarget.id == null) return;
    setDeleteBusy(true);
    setNotice(null);
    try {
      await accountApi.deleteAccount(deleteTarget.id);
      setDeleteTarget(null);
      setNotice({ ok: true, message: `Account ${deleteTarget.accountNumber} deleted.` });
      result.reload();
    } catch (error) {
      setDeleteTarget(null);
      setNotice({ ok: false, message: error.message });
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Accounts</h1>
      {!result.loading && result.data && accounts.length > 0 && !supportsIds && <Alert tone="info">Account status changes and deletion become available when the backend includes the database <code>id</code> in <code>AccountDto</code>. The current list response does not contain that ID.</Alert>}
      <Alert tone="info">Admins can change account status only. Customer balances and transaction history cannot be edited here.</Alert>
      {notice && <Alert tone={notice.ok ? 'success' : 'error'}>{notice.message}</Alert>}
      <section className="card">
        {result.loading && !result.data ? <LoadingState />
          : result.error ? <ErrorState message={result.error} onRetry={result.reload} />
          : <DataTable columns={columns} rows={accounts} rowKey={(account, index) => account.id ?? account.accountNumber ?? index} empty="No accounts found." />}
      </section>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete account?"
        confirmLabel="Delete account"
        busy={deleteBusy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      >
        <p>Delete account {deleteTarget?.accountNumber}? This may be rejected if the account has transaction history.</p>
      </ConfirmDialog>
    </div>
  );
}
