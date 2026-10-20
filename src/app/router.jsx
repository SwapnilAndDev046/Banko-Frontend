import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute, { IntegrationNotice } from '../components/layout/ProtectedRoute';
import RoleGuard from '../components/layout/RoleGuard';
import { LoadingState } from '../components/ui/States';
import { CustomerShell } from '../context/AccountsContext';
import { useAuth } from '../context/AuthContext';
import HomePage from '../pages/public/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import NotFoundPage from '../pages/NotFoundPage';
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import TransactionsPage from '../pages/customer/TransactionsPage';
import CreateAccountPage from '../pages/customer/CreateAccountPage';
import ProfilePage from '../pages/customer/ProfilePage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import CustomersPage from '../pages/admin/CustomersPage';
import AccountsPage from '../pages/admin/AccountsPage';
import BranchesPage from '../pages/admin/BranchesPage';

// "/" : guests see the landing page; a user whose role is resolved goes to their dashboard.
function RootRoute() {
  const { status, user } = useAuth();
  if (status === 'loading') return <LoadingState label="Checking your session…" />;
  if (status === 'role-unresolved') return <IntegrationNotice />;
  if (status === 'ready') return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/customer/dashboard'} replace />;
  return <HomePage />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<RootRoute />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="customer" element={<RoleGuard role="CUSTOMER" />}>
          <Route element={<DashboardLayout />}>
            <Route element={<CustomerShell />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="accounts/new" element={<CreateAccountPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Route>
        </Route>

        <Route path="admin" element={<RoleGuard role="ADMIN" />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="branches" element={<BranchesPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
