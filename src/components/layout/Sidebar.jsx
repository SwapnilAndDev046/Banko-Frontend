import { NavLink } from 'react-router-dom';
import { Building2, CreditCard, LayoutDashboard, PlusCircle, Receipt, UserCircle, Users } from 'lucide-react';

const NAV = {
  CUSTOMER: [
    { to: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/customer/transactions', label: 'Transactions', icon: Receipt },
    { to: '/customer/accounts/new', label: 'Open account', icon: PlusCircle },
    { to: '/customer/profile', label: 'Profile', icon: UserCircle },
  ],
  ADMIN: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/accounts', label: 'Accounts', icon: CreditCard },
    { to: '/admin/branches', label: 'Branches', icon: Building2 },
  ],
};

export default function Sidebar({ role, open, onNavigate }) {
  return (
    <nav
      aria-label={role === 'ADMIN' ? 'Admin' : 'Customer'}
      className={`${open ? 'block' : 'hidden'} w-full shrink-0 border-b border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 lg:block lg:min-h-[calc(100vh-3.5rem)] lg:w-56 lg:border-b-0 lg:border-r lg:bg-transparent lg:dark:bg-transparent`}
    >
      <ul className="space-y-1">
        {NAV[role].map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
