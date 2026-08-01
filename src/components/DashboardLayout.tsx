import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import { WalletBalanceBadge } from '../components/WalletBalanceBadge';
import { FundAccountModal } from '../modules/funding/FundAccountModal';

const navItems = [
  { to: '/marketplace', label: 'Marketplace', icon: MarketIcon },
  { to: '/seller', label: 'Seller Dashboard', icon: SellerIcon },
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
      <path d="M5 18.5h14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M7.5 8.5 12 5l4.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 18.5v-7H15v7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
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

function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.5 12a6.5 6.5 0 0 1 11-4.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M16.5 6.5h-3.25" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M13.25 6.5v3.25" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M18.5 12a6.5 6.5 0 0 1-11 4.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M7.5 17.5h3.25" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M10.75 17.5v-3.25" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function DashboardLayout() {
  const { resetData } = useAppData();
  const { showToast } = useToast();
  const [fundOpen, setFundOpen] = useState(false);
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const handleReset = () => {
    resetData();
    showToast('Demo data reset.', 'info');
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
        <button
          type="button"
          className="dashboard-sidebar__link dashboard-sidebar__action"
          onClick={handleReset}
          title="Reset demo"
          aria-label="Reset demo"
        >
          <ResetIcon />
        </button>
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