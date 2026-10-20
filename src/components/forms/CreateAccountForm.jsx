import { useState } from 'react';
import * as accountApi from '../../services/accountApi';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { Alert } from '../ui/States';

// Sends exactly { initialDeposit, branchName }. The backend assigns the owner from the login token.
export default function CreateAccountForm({ branches, onCreated }) {
  const [branchName, setBranchName] = useState('');
  const [deposit, setDeposit] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    const next = {};
    if (!branchName) next.branch = 'Choose a branch.';
    if (!(Number(deposit) > 0)) next.deposit = 'Enter an initial deposit greater than zero.';
    setErrors(next);
    setServerError('');
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      await accountApi.createAccount({ initialDeposit: Number(deposit), branchName });
      await onCreated();
    } catch (err) {
      setServerError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="card max-w-lg space-y-4 p-6">
      <FormField label="Branch" id="account-branch" error={errors.branch}>
        <select value={branchName} onChange={(e) => setBranchName(e.target.value)} disabled={busy}>
          <option value="">Select a branch</option>
          {branches.map((b) => <option key={b.IFSC_CODE || b.branchName} value={b.branchName}>{b.branchName}{b.city ? `, ${b.city}` : ''}</option>)}
        </select>
      </FormField>
      <FormField label="Initial deposit" id="account-deposit" type="number" inputMode="decimal" min="0" step="0.01" value={deposit} onChange={(e) => setDeposit(e.target.value)} error={errors.deposit} disabled={busy} />
      {serverError && <Alert tone="error">{serverError}</Alert>}
      <Button type="submit" loading={busy}>Open account</Button>
    </form>
  );
}
