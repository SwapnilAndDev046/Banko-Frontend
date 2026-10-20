import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as authApi from '../../services/authApi';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Alert } from '../../components/ui/States';

// Customer registration only. SignupRequestDto has no role, and neither does this form.
export default function RegisterPage() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phoneNumber: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  if (status === 'ready' || status === 'role-unresolved') return <Navigate to="/" replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    const next = {};
    if (!form.name.trim()) next.name = 'Enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email address.';
    if (!/^\+?[0-9\s-]{7,15}$/.test(form.phoneNumber.trim())) next.phoneNumber = 'Enter a valid phone number.';
    if (form.password.length < 8) next.password = 'Use at least 8 characters.';
    setErrors(next);
    setServerError('');
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      await authApi.register({ name: form.name.trim(), email: form.email.trim(), phoneNumber: form.phoneNumber.trim(), password: form.password });
      setForm((f) => ({ ...f, password: '' }));
      navigate('/login', { replace: true, state: { message: 'Your Banko account was created. Log in to continue.' } });
    } catch (err) {
      setForm((f) => ({ ...f, password: '' }));
      setServerError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <h1 className="text-2xl font-bold">Create your Banko account</h1>
      <form onSubmit={submit} noValidate className="card mt-6 space-y-4 p-6">
        <FormField label="Full name" id="reg-name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} disabled={busy} />
        <FormField label="Email" id="reg-email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} disabled={busy} />
        <FormField label="Phone number" id="reg-phone" type="tel" autoComplete="tel" value={form.phoneNumber} onChange={set('phoneNumber')} error={errors.phoneNumber} disabled={busy} />
        <FormField label="Password" id="reg-password" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} hint="At least 8 characters." disabled={busy} />
        {serverError && <Alert tone="error">{serverError}</Alert>}
        <Button type="submit" loading={busy} className="w-full">Register Now</Button>
      </form>
      <p className="muted mt-4 text-sm">
        Already registered? <Link to="/login" className="font-semibold text-indigo-600 underline dark:text-indigo-400">Log in</Link>
      </p>
    </div>
  );
}
