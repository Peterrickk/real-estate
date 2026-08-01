import { useState, type FormEvent } from 'react';
import { useAuth, type HomeRoute } from '../../context/AuthContext';

const homeOptions: Array<{ value: HomeRoute; label: string }> = [
  { value: '/marketplace', label: 'Marketplace' },
  { value: '/seller', label: 'Seller Workspace' },
  { value: '/history', label: 'Ownership History' },
  { value: '/insights', label: 'Land Insights' },
];

export function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName ?? 'Avery');
  const [email, setEmail] = useState(user?.email ?? 'avery@example.com');
  const [preferredHome, setPreferredHome] = useState<HomeRoute>(user?.preferredHome ?? '/marketplace');

  const safePreferredHome = homeOptions.some((option) => option.value === preferredHome)
    ? preferredHome
    : homeOptions[0]?.value ?? '/marketplace';

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateProfile({ displayName, email, preferredHome: safePreferredHome });
  };

  return (
    <section className="dashboard-page settings-page">
      <header className="page-intro">
        <h2>Settings</h2>
      </header>

      <div className="settings-grid">
        <article className="card settings-card">
          <h3>Account</h3>
          <form className="settings-form" onSubmit={handleSave}>
            <label className="filter-field">
              <span>Name</span>
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
            </label>

            <label className="filter-field">
              <span>Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>

            <label className="filter-field">
              <span>Default landing</span>
              <select
                value={safePreferredHome}
                onChange={(event) => setPreferredHome(event.target.value as HomeRoute)}
              >
                {homeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <p className="muted">Choose where you want to land after sign-in.</p>

            <button type="submit" className="btn btn-primary">
              Save changes
            </button>
          </form>
        </article>

        <article className="card settings-card">
          <h3>Session</h3>
          <p className="muted">Your active session stays local to this browser.</p>
          <dl className="detail-list detail-list--prose settings-summary">
            <div>
              <dt>Signed in as</dt>
              <dd>{user?.displayName ?? 'Guest'}</dd>
            </div>
            <div>
              <dt>Landing page</dt>
              <dd>{safePreferredHome}</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  );
}