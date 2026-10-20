import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Brand } from './AppNavbar';
import Sidebar from './Sidebar';
import StatusBadge from '../ui/StatusBadge';
import ThemeToggle from '../ui/ThemeToggle';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <Brand />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 text-sm sm:flex">
              {user.name || user.email}
              <StatusBadge label={user.role} />
            </span>
            <ThemeToggle />
            <button className="btn btn-secondary" onClick={() => { logout(); navigate('/'); }}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        <Sidebar role={user.role} open={open} onNavigate={() => setOpen(false)} />
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
