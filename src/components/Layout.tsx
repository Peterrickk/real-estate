import { Outlet } from 'react-router-dom';
import { RegistryNavbar } from './RegistryNavbar';

export function Layout() {
  return (
    <div className="app-shell app-shell--marketing">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <RegistryNavbar />
      <main id="main-content" className="marketing-main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
