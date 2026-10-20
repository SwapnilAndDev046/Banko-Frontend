import { useState } from 'react';
import * as transactionApi from '../../services/transactionApi';
import { formatCurrency } from '../../utils/formatCurrency';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import FormField from '../ui/FormField';
import { Alert } from '../ui/States';

// Fields match the backend DTO exactly: sender, receiver, amount. No note field.
export default function TransferForm({ account, onDone }) {
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState({});
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const active = account.status === 'ACTIVE';

  function review(e) {
    e.preventDefault();
    const next = {};
    const to = receiver.trim();
    if (!to) next.receiver = 'Enter the receiving account number.';
    else if (to === account.accountNumber) next.receiver = 'Choose a different account from the one you are sending from.';
    if (!(Number(amount) > 0)) next.amount = 'Enter an amount greater than zero.';
    setErrors(next);
    setResult(null);
    if (Object.keys(next).length === 0) setConfirming(true);
  }

  async function send() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await transactionApi.transfer({
        senderAccountNumber: account.accountNumber,
        receiverAccountNumber: receiver.trim(),
        amount: Number(amount),
      });
      setResult({ ok: true, ref: res && (res.referenceID || res.referenceId) });
      setReceiver('');
      setAmount('');
      setConfirming(false);
      await onDone();
    } catch (err) {
      setConfirming(false);
      setResult({ ok: false, message: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <form onSubmit={review} noValidate className="card space-y-4 p-6">
        <h2 className="text-lg font-bold">Transfer</h2>
        {!active && <Alert tone="warning">This account is {account.status.toLowerCase()}, so transfers are turned off.</Alert>}
        <p className="muted text-sm">From <span className="font-semibold tabular-nums">{account.accountNumber}</span></p>
        <FormField label="Receiving account number" id="transfer-to" value={receiver} onChange={(e) => setReceiver(e.target.value)} error={errors.receiver} disabled={!active || busy} autoComplete="off" />
        <FormField label="Amount" id="transfer-amount" type="number" inputMode="decimal" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} error={errors.amount} disabled={!active || busy} />
        {result && (result.ok
          ? <Alert tone="success">Transfer completed{result.ref ? `. Reference: ${result.ref}` : '.'}</Alert>
          : <Alert tone="error">{result.message}</Alert>)}
        <Button type="submit" disabled={!active || busy}>Review transfer</Button>
      </form>
      <ConfirmDialog open={confirming} title="Confirm transfer" confirmLabel="Send money" busy={busy} onConfirm={send} onCancel={() => setConfirming(false)}>
        <p>
          Send <strong className="text-slate-900 dark:text-white">{formatCurrency(amount)}</strong> from{' '}
          <span className="tabular-nums">{account.accountNumber}</span> to <span className="tabular-nums">{receiver.trim()}</span>?
        </p>
        <p className="mt-2">Check the receiving account number carefully before you continue.</p>
      </ConfirmDialog>
    </>
  );
}
