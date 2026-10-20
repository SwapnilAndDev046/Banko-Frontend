import { useState } from 'react';
import * as transactionApi from '../../services/transactionApi';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { Alert } from '../ui/States';

export default function DepositForm({ account, onDone }) {
  const [amount, setAmount] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const active = account.status === 'ACTIVE';

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    const value = Number(amount);
    if (!(value > 0)) return setFieldError('Enter an amount greater than zero.');
    setFieldError('');
    setResult(null);
    setBusy(true);
    try {
      const tx = await transactionApi.deposit({ amount: value, accountNumber: account.accountNumber });
      setResult({ ok: true, ref: tx && tx.referenceId });
      setAmount('');
      await onDone();
    } catch (err) {
      setResult({ ok: false, message: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="card space-y-4 p-6">
      <h2 className="text-lg font-bold">Deposit</h2>
      {!active && <Alert tone="warning">This account is {account.status.toLowerCase()}, so deposits are turned off.</Alert>}
      <FormField label="Amount" id="deposit-amount" type="number" inputMode="decimal" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} error={fieldError} disabled={!active || busy} />
      {result && (result.ok
        ? <Alert tone="success">Deposit completed{result.ref ? `. Reference: ${result.ref}` : '.'}</Alert>
        : <Alert tone="error">{result.message}</Alert>)}
      <Button type="submit" loading={busy} disabled={!active}>Deposit money</Button>
    </form>
  );
}
