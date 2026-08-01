import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/registry', label: 'Property Registry' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/history', label: 'Ownership History' },
  { to: '/insights', label: 'Land Insights' },
];

export function Navbar() {
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
      </ul>
    </nav>
  );
}
