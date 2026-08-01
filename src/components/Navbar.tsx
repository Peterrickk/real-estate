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
    <nav className="navbar">
      <NavLink to="/registry" className="navbar-brand">
        BCH Real Estate
      </NavLink>
      <ul className="navbar-links">
        {navItems.map(({ to, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {label}
            </NavLink>
          </li>
        ))}
        <li>
          <button type="button" className="nav-link nav-reset" onClick={handleReset}>
            Reset demo
          </button>
        </li>
      </ul>
    </nav>
  );
}
