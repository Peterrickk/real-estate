import { NavLink, useLocation, useNavigate } from 'react-router-dom';

export function RegistryNavbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onLoginPage = pathname === '/login';

  return (
    <nav className="site-nav registry-nav" aria-label="Primary">
      <NavLink to="/registry/PropertyRegistryPage" className="site-nav__brand">
        <img src="/susi-logo.png" alt="SUSI" className="site-nav__logo" />
      </NavLink>
      {!onLoginPage ? (
        <button
          type="button"
          className="site-nav__login btn btn-primary"
          onClick={() => navigate('/login')}
        >
          Login
        </button>
      ) : null}
    </nav>
  );
}
