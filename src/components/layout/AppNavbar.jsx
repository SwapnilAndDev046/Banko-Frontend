import { Link, useNavigate } from 'react-router-dom';
import { Landmark, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';

export function Brand() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2 text-xl font-extrabold tracking-tight">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white dark:bg-indigo-500">
        <Landmark className="h-4 w-4" aria-hidden="true" />
      </span>
      Banko
    </Link>
  );
}

// Guests see public navigation only. A token without a resolved role is not treated as a guest.
export default function AppNavbar() {
  const { status, user, logout } = useAuth();
  const navigate = useNavigate();
  const signedIn = status === 'ready' && user;
  const roleUnresolved = status === 'role-unresolved';
  const guest = status === 'guest';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:px-6">
        <Brand />
        <nav aria-label="Main" className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          {guest && (
            <>
              <a href="/#features" className="muted hidden rounded px-2 py-1 text-sm font-medium hover:text-slate-900 dark:hover:text-white md:block">Features</a>
              <a href="/#how-it-works" className="muted hidden rounded px-2 py-1 text-sm font-medium hover:text-slate-900 dark:hover:text-white md:block">How it works</a>
            </>
          )}
          <ThemeToggle />
          {signedIn ? (
            <>
              <Link className="btn btn-secondary px-2.5 py-2 text-xs sm:px-4 sm:text-sm" to={user.role === 'ADMIN' ? '/admin/dashboard' : '/customer/dashboard'}>Dashboard</Link>
              <button className="btn btn-secondary px-2.5 py-2 text-xs sm:px-4 sm:text-sm" onClick={() => { logout(); navigate('/'); }}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </>
          ) : roleUnresolved ? (
            <button className="btn btn-secondary px-2.5 py-2 text-xs sm:px-4 sm:text-sm" onClick={() => { logout(); navigate('/'); }}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          ) : (
            <>
              <Link className="btn btn-secondary px-2.5 py-2 text-xs sm:px-4 sm:text-sm" to="/login">Login</Link>
              <Link className="btn btn-primary px-2.5 py-2 text-xs sm:px-4 sm:text-sm" to="/register">Register Now</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
