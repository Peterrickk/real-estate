import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/registry', label: 'Property Registry' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/history', label: 'Ownership History' },
  { to: '/insights', label: 'Land Insights' },
];

export function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/registry" className="navbar-brand">
          BCH Real Estate
        </NavLink>
        <nav className="navbar-nav" aria-label="Primary">
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
      </div>
    </header>
  );
}
