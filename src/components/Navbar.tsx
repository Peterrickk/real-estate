import { NavLink } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';

const navItems = [
  { to: '/registry', label: 'Property Registry' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/history', label: 'Ownership History' },
  { to: '/insights', label: 'Land Insights' },
];

export function Navbar() {
  const { resetData } = useAppData();
  const { showToast } = useToast();

  const handleReset = () => {
    resetData();
    showToast('Demo data reset.', 'info');
  };

  return (
    <nav className="site-nav" aria-label="Primary">
      <NavLink to="/registry" className="site-nav__brand">
        BCH Real Estate
      </NavLink>
      <ul className="site-nav__links">
        {navItems.map(({ to, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) => (isActive ? 'site-nav__link is-active' : 'site-nav__link')}
            >
              {label}
            </NavLink>
          </li>
        ))}
        <li>
          <button type="button" className="site-nav__link site-nav__reset" onClick={handleReset}>
            Reset demo
          </button>
        </li>
      </ul>
    </nav>
  );
}
