import { useNavigate } from 'react-router-dom';
import { useState, type FormEvent } from 'react';
import { Navbar } from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

export function LoginPanelPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('Avery');
  const [email, setEmail] = useState('avery@example.com');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login({
      displayName,
      email,
      preferredHome: '/marketplace',
    });
    navigate('/marketplace', { replace: true });
  };

  return (
    <>
      <Navbar />
      <section className="auth-page">
        <div className="auth-hero marketing-hero">
          <div className="marketing-hero__backdrop" />
          <div className="marketing-hero__content auth-hero__content">
            <p className="marketing-hero__eyebrow">TOKENIZED REAL ESTATE REGISTRY</p>
            <h1>Architected for ownership, styled like an editorial feature.</h1>
            <p>
              Explore the registry of tokenized homes and land parcels through a curated real-estate
              showcase with search-first discovery.
            </p>
          </div>

          <form className="hero-search auth-hero__search" onSubmit={(event) => event.preventDefault()}>
            <label className="hero-search__field">
              <span>Location</span>
              <select defaultValue="All locations">
                <option>All locations</option>
                <option>Miami, FL</option>
                <option>Austin, TX</option>
                <option>Phoenix, AZ</option>
                <option>Denver, CO</option>
              </select>
            </label>
            <label className="hero-search__field">
              <span>Property Type</span>
              <select defaultValue="All properties">
                <option>All properties</option>
                <option>Single-family</option>
                <option>Townhome</option>
                <option>Land</option>
                <option>Estate</option>
              </select>
            </label>
            <label className="hero-search__field hero-search__field--range">
              <span>Price Range</span>
              <strong>$700,000</strong>
              <input type="number" defaultValue={700_000} min={350_000} max={700_000} inputMode="numeric" />
            </label>
            <label className="hero-search__field hero-search__field--range">
              <span>Size</span>
              <strong>3,500 sq ft</strong>
              <input type="number" defaultValue={3_500} min={1_500} max={4_000} inputMode="numeric" />
            </label>
          </form>
        </div>

        <div className="auth-card card">
          <header className="auth-card__header">
            <p className="section-heading__eyebrow">Secure access</p>
            <h2>Login</h2>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="filter-field">
              <span>Name</span>
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
            </label>

            <label className="filter-field">
              <span>Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>

            <button type="submit" className="btn btn-primary auth-submit">
              Continue
            </button>
          </form>
        </div>
      </section>
    </>
  );
}