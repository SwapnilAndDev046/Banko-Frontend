import { Outlet } from 'react-router-dom';
import AppNavbar from './AppNavbar';
import AppFooter from './AppFooter';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
