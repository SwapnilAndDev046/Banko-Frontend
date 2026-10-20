import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { Alert, LoadingState } from '../ui/States';

/** Shown when a token exists but the backend cannot tell us the user's role. No role is guessed. */
export function IntegrationNotice() {
  const { error, retry, logout } = useAuth();
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="card space-y-4 p-6">
        <h1 className="text-xl font-bold">Signed in, but your role could not be confirmed</h1>
        <Alert tone="warning">{error || 'The server did not identify your account type.'}</Alert>
        <p className="muted text-sm">
          The current Banko backend returns only a token when you log in. It has no endpoint that tells the frontend whether you
          are a CUSTOMER or an ADMIN, and the token has no role claim. The frontend will not guess.
        </p>
        <p className="text-sm">
          Backend change needed: add a protected <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">GET /api/v1/auth/me</code> returning{' '}
          <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">{'{ id, name, email, phoneNumber, role }'}</code>. See the README, section
          “Backend integration gaps”.
        </p>
        <div className="flex gap-2">
          <Button onClick={retry}>Check again</Button>
          <Button variant="secondary" onClick={logout}>Log out</Button>
        </div>
      </div>
    </div>
  );
}

// Guards are a UX convenience. Spring Security is the real authorization boundary.
export default function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <LoadingState label="Checking your session…" />;
  if (status === 'guest') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (status === 'role-unresolved') return <IntegrationNotice />;
  return <Outlet />;
}
