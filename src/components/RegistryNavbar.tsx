import { NavLink, useNavigate } from 'react-router-dom';

export function RegistryNavbar() {
  const navigate = useNavigate();

  return (
    <nav className="site-nav registry-nav" aria-label="Primary">
      <NavLink to="/registry" className="site-nav__brand">
        BCH Real Estate
      </NavLink>
      <button
        type="button"
        className="site-nav__login btn btn-primary"
        onClick={() => navigate('/marketplace')}
      >
        Login
      </button>
    </nav>
  );
}
