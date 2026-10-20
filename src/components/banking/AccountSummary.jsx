import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';
import { Alert } from '../ui/States';
import { formatCurrency } from '../../utils/formatCurrency';
import * as accountApi from '../../services/accountApi';

// The account list DTO supplies a numeric balance. The separate balance endpoint
// returns plain text, so the user can request a fresh server-side balance check.
export default function AccountSummary({ account }) {
  const [checking, setChecking] = useState(false);
  const [balanceMessage, setBalanceMessage] = useState('');
  const [error, setError] = useState('');

  async function checkBalance() {
    if (checking) return;
    setChecking(true);
    setError('');
    setBalanceMessage('');
    try {
      const response = await accountApi.balanceMessage(account.accountNumber);
      setBalanceMessage(typeof response === 'string' ? response : JSON.stringify(response));
    } catch (err) {
      setError(err.message || 'Unable to check this balance.');
    } finally {
      setChecking(false);
    }
  }

  return (
    <section aria-label="Selected account" className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="muted text-sm">Account <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{account.accountNumber}</span></p>
        <StatusBadge label={account.status} />
      </div>
      <p className="muted mt-4 text-sm">Available balance</p>
      <p className="text-4xl font-extrabold tracking-tight tabular-nums">{formatCurrency(account.balance)}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="muted text-xs">Branch ID {account.branchId ?? '—'}</p>
        <Button variant="secondary" onClick={checkBalance} loading={checking}>
          {!checking && <RefreshCw className="h-4 w-4" aria-hidden="true" />}
          Refresh balance
        </Button>
      </div>
      {balanceMessage && <div className="mt-3"><Alert tone="success">{balanceMessage}</Alert></div>}
      {error && <div className="mt-3"><Alert tone="error">{error}</Alert></div>}
    </section>
  );
}
