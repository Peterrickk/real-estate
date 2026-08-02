import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { WalletBalanceBadge } from '../components/WalletBalanceBadge';
import { FundAccountModal } from '../modules/funding/FundAccountModal';

const navItems = [
  { to: '/marketplace', label: 'Marketplace', icon: MarketIcon },
  { to: '/dashboard', label: 'My Dashboard', icon: SellerIcon },
];

function MarketIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16l-1.5 12h-13z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M7 7c0-2.5 2-4.5 5-4.5S17 4.5 17 7" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9.2 11.5h5.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function SellerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="3" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="14" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <rect x="3" y="14" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function FundIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7.5v9" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M7.5 12h9" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 4.5v1.75M12 17.75v1.75M19.5 12h-1.75M6.25 12H4.5M17.13 6.87l-1.24 1.24M8.11 15.89l-1.24 1.24M17.13 17.13l-1.24-1.24M8.11 8.11 6.87 6.87"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M14.5 8V6.75A1.75 1.75 0 0 0 12.75 5h-6A1.75 1.75 0 0 0 5 6.75v10.5A1.75 1.75 0 0 0 6.75 19h6a1.75 1.75 0 0 0 1.75-1.75V16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9.5 12h9.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M16 8.5 19.5 12 16 15.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DashboardLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [fundOpen, setFundOpen] = useState(false);
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="dashboard-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <aside className="dashboard-sidebar" aria-label="Primary">
        <NavLink to="/marketplace" className="dashboard-sidebar__brand" aria-label="BCH Real Estate">
          BCH
        </NavLink>
        <nav className="dashboard-sidebar__nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              aria-label={label}
              className={({ isActive }) =>
                isActive ? 'dashboard-sidebar__link is-active' : 'dashboard-sidebar__link'
              }
            >
              <Icon />
            </NavLink>
          ))}
          <button
            type="button"
            className="dashboard-sidebar__link"
            onClick={() => setFundOpen(true)}
            title="Buy BCH"
            aria-label="Buy BCH"
          >
            <FundIcon />
          </button>
        </nav>
        <div className="dashboard-sidebar__footer">
          <NavLink
            to="/settings"
            title="Settings"
            aria-label="Settings"
            className={({ isActive }) =>
              isActive ? 'dashboard-sidebar__link is-active' : 'dashboard-sidebar__link'
            }
          >
            <SettingsIcon />
          </NavLink>
          <button
            type="button"
            className="dashboard-sidebar__link dashboard-sidebar__action"
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
          >
            <LogoutIcon />
          </button>
        </div>
      </aside>

      <div className="dashboard-frame">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-header__eyebrow">Real estate operations</p>
            <h1>Welcome, Avery</h1>
          </div>
          <div className="dashboard-header__meta">
            <p className="dashboard-header__date">{today}</p>
            <WalletBalanceBadge />
          </div>
        </header>

        <main id="main-content" className="dashboard-main" tabIndex={-1}>
          <Outlet />
        </main>
      </div>

      {fundOpen && <FundAccountModal onClose={() => setFundOpen(false)} />}
    </div>
  );
}