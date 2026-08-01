import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, type HomeRoute } from '../../context/AuthContext';

type AuthMode = 'login' | 'signup';

function resolvePreferredHome(from: string): HomeRoute {
  if (from.startsWith('/seller')) return '/seller';
  if (from.startsWith('/history')) return '/history';
  if (from.startsWith('/insights')) return '/insights';
  return '/marketplace';
}

export function LoginPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/marketplace';

  const [mode, setMode] = useState<AuthMode>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Enter your email to continue.');
      return;
    }

    if (!password) {
      setError('Enter your password to continue.');
      return;
    }

    if (mode === 'signup') {
      if (!displayName.trim()) {
        setError('Enter your name to create an account.');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signup') {
        await signup({
          displayName,
          email,
          password,
          preferredHome: resolvePreferredHome(from),
        });
      } else {
        await login({ email, password });
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setMode('login');
    setError('');
    setEmail('avery@example.com');
    setPassword('demo1234');
  };

  const isSignup = mode === 'signup';

  return (
    <section className="login-page">
      <div className="login-page__visual" aria-hidden="true">
        <div className="login-page__visual-backdrop" />
        <div className="login-page__visual-copy">
          <p className="login-page__brand">BCH Real Estate</p>
          <h2>Your registry credentials unlock the full ownership stack.</h2>
          <p>
            {isSignup
              ? 'Create an account to browse listings, manage seller workflows, and review on-chain ownership history.'
              : 'Sign in to browse listings, manage seller workflows, and review on-chain ownership history from one connected workspace.'}
          </p>
        </div>
      </div>

      <div className="login-page__panel">
        <div className="login-tabs" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            role="tab"
            id="login-tab"
            aria-selected={!isSignup}
            aria-controls="auth-panel"
            className={isSignup ? 'login-tabs__tab' : 'login-tabs__tab is-active'}
            onClick={() => switchMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            id="signup-tab"
            aria-selected={isSignup}
            aria-controls="auth-panel"
            className={isSignup ? 'login-tabs__tab is-active' : 'login-tabs__tab'}
            onClick={() => switchMode('signup')}
          >
            Sign up
          </button>
        </div>

        <header className="login-page__header">
          <h1>{isSignup ? 'Create account' : 'Sign in'}</h1>
          <p>
            {isSignup
              ? 'Register to access marketplace and seller tools.'
              : 'Use your account to access marketplace and seller tools.'}
          </p>
        </header>

        <form
          id="auth-panel"
          role="tabpanel"
          aria-labelledby={isSignup ? 'signup-tab' : 'login-tab'}
          className="login-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {isSignup ? (
            <label className="filter-field">
              <span>Name</span>
              <input
                type="text"
                name="displayName"
                autoComplete="name"
                required
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </label>
          ) : null}

          <label className="filter-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="filter-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              placeholder={isSignup ? 'At least 6 characters' : 'Enter your password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {isSignup ? (
            <label className="filter-field">
              <span>Confirm password</span>
              <input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </label>
          ) : null}

          {error ? (
            <p className="login-form__error" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" className="btn btn-primary login-form__submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
          </button>
        </form>

        {!isSignup ? (
          <p className="login-page__demo-hint">
            Demo account: <code>avery@example.com</code> / <code>demo1234</code> —{' '}
            <button type="button" className="login-page__switch" onClick={fillDemoCredentials}>
              use it
            </button>
          </p>
        ) : null}

        <p className="login-page__footer">
          {isSignup ? (
            <>
              Already have an account?{' '}
              <button type="button" className="login-page__switch" onClick={() => switchMode('login')}>
                Sign in
              </button>
            </>
          ) : (
            <>
              New here?{' '}
              <button type="button" className="login-page__switch" onClick={() => switchMode('signup')}>
                Create an account
              </button>
            </>
          )}
          {' · '}
          <Link to="/registry/PropertyRegistryPage">Back to registry</Link>
        </p>
      </div>
    </section>
  );
}