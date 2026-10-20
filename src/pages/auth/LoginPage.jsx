import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Alert } from '../../components/ui/States';

export default function LoginPage() {
  const { status, login, notice } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  if (status === 'ready' || status === 'role-unresolved') return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    const next = {};
    if (!email.trim()) next.email = 'Enter your email address.';
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    setServerError('');
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      await login(email.trim(), password);
      setPassword(''); // never keep the password in state after submitting
      navigate('/', { replace: true });
    } catch (err) {
      setPassword('');
      setServerError(err.status === 401 || err.status === 403 ? 'Email or password is incorrect.' : err.message);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <h1 className="text-2xl font-bold">Log in to Banko</h1>
      <form onSubmit={submit} noValidate className="card mt-6 space-y-4 p-6">
        {location.state && location.state.message && <Alert tone="success">{location.state.message}</Alert>}
        {notice && <Alert tone="warning">{notice}</Alert>}
        <FormField label="Email" id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} disabled={busy} />
        <FormField label="Password" id="login-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} disabled={busy} />
        {serverError && <Alert tone="error">{serverError}</Alert>}
        <Button type="submit" loading={busy} className="w-full">Log in</Button>
      </form>
      <p className="muted mt-4 text-sm">
        New to Banko? <Link to="/register" className="font-semibold text-indigo-600 underline dark:text-indigo-400">Register now</Link>
      </p>
    </div>
  );
}
