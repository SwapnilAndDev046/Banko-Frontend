import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function UnauthorizedPage() {
  const { user } = useAuth();
  const home = user ? (user.role === 'ADMIN' ? '/admin/dashboard' : '/customer/dashboard') : '/';
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">You don't have access to this page</h1>
      <p className="muted mt-3 text-sm">Your account type can't open this area of Banko.</p>
      <Link to={home} className="btn btn-primary mt-6">{user ? 'Go to my dashboard' : 'Back to Banko'}</Link>
    </div>
  );
}
