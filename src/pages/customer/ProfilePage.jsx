import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as customerApi from '../../services/customerApi';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Alert } from '../../components/ui/States';

// Values are loaded from the proposed authenticated GET /api/v1/auth/me endpoint.
// No password field is displayed or stored here.
export default function ProfilePage() {
  const { user, clearWithNotice, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user.name || '', email: user.email || '', phoneNumber: user.phoneNumber || '' });
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = 'Enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email address.';
    if (!/^\+?[0-9\s-]{7,15}$/.test(form.phoneNumber.trim())) next.phoneNumber = 'Enter a valid phone number.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function getChanges() {
    const changes = {};
    if (form.name.trim() !== user.name) changes.name = form.name.trim();
    if (form.email.trim() !== user.email) changes.email = form.email.trim();
    if (form.phoneNumber.trim() !== user.phoneNumber) changes.phoneNumber = form.phoneNumber.trim();
    return changes;
  }

  async function save(mode) {
    if (busy || !validate()) return;
    const changes = getChanges();
    if (!Object.keys(changes).length) {
      setResult({ ok: true, message: 'No changes to save.' });
      return;
    }

    setBusy(true);
    setResult(null);
    try {
      if (mode === 'put') {
        await customerApi.replaceProfile({
          name: form.name.trim(),
          email: form.email.trim(),
          phoneNumber: form.phoneNumber.trim(),
        });
      } else {
        await customerApi.updateProfile(changes);
      }

      if (changes.email) {
        clearWithNotice('Your email was updated. Please sign in again with the new email.');
        navigate('/login', { replace: true });
        return;
      }

      await refreshUser();
      setResult({ ok: true, message: mode === 'put' ? 'Profile details replaced successfully.' : 'Changed profile fields updated successfully.' });
    } catch (err) {
      setResult({ ok: false, message: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function submitPut(event) {
    event.preventDefault();
    await save('put');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <form onSubmit={submitPut} noValidate className="card max-w-lg space-y-4 p-6">
        <FormField label="Full name" id="profile-name" value={form.name} onChange={set('name')} error={errors.name} disabled={busy} />
        <FormField label="Email" id="profile-email" type="email" value={form.email} onChange={set('email')} error={errors.email} hint="Changing your email will sign you out so you can sign in again." disabled={busy} />
        <FormField label="Phone number" id="profile-phone" type="tel" value={form.phoneNumber} onChange={set('phoneNumber')} error={errors.phoneNumber} disabled={busy} />
        {result && <Alert tone={result.ok ? 'success' : 'error'}>{result.message}</Alert>}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button type="submit" loading={busy}>Save all details</Button>
          <Button type="button" variant="secondary" disabled={busy} onClick={() => save('patch')}>Save changed fields only</Button>
        </div>
      </form>
    </div>
  );
}
