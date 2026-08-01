import { useMemo, useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { PropertyCard } from './PropertyCard';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

function getLocation(propertyAddress: string): string {
  const parts = propertyAddress.split(', ').slice(1);
  return parts.join(', ');
}

function getSizeValue(size: string): number {
  return Number.parseInt(size.replace(/[^\d]/g, ''), 10) || 0;
}

export function PropertyRegistryPage() {
  const { data } = useAppData();
  const locations = useMemo(
    () => Array.from(new Set(data.properties.map((property) => getLocation(property.address)))),
    [data.properties],
  );
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [maxPrice, setMaxPrice] = useState(700_000);
  const [maxSize, setMaxSize] = useState(3_500);

  const filteredProperties = useMemo(
    () =>
      data.properties.filter((property) => {
        const location = getLocation(property.address);
        const sizeValue = getSizeValue(property.size);
        const listedPrice = property.listedPrice ?? 0;

        const matchesLocation = locationFilter === 'all' || location === locationFilter;
        const matchesType =
          typeFilter === 'all' ||
          (typeFilter === 'tokenized' && property.tokenized) ||
          (typeFilter === 'listed' && property.listedPrice !== null) ||
          (typeFilter === 'unlisted' && property.listedPrice === null);
        const matchesPrice = property.listedPrice === null || listedPrice <= maxPrice;
        const matchesSize = sizeValue <= maxSize;

        return matchesLocation && matchesType && matchesPrice && matchesSize;
      }),
    [data.properties, locationFilter, typeFilter, maxPrice, maxSize],
  );

  return (
    <section className="marketing-page">
      <header className="marketing-hero">
        <div className="marketing-hero__backdrop" />
        <div className="marketing-hero__content">
          <p className="marketing-hero__eyebrow">Tokenized real estate registry</p>
          <h1>Architected for ownership, styled like an editorial feature.</h1>
          <p>
            Explore the registry of tokenized homes and land parcels through a curated real-estate
            showcase with search-first discovery.
          </p>
        </div>
      </header>

      <form className="hero-search" onSubmit={(event) => event.preventDefault()}>
        <label className="hero-search__field">
          <span>Location</span>
          <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
            <option value="all">All locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </label>
        <label className="hero-search__field">
          <span>Property Type</span>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="all">All properties</option>
            <option value="tokenized">Tokenized</option>
            <option value="listed">For sale</option>
            <option value="unlisted">Off market</option>
          </select>
        </label>
        <label className="hero-search__field hero-search__field--range">
          <span>Price Range</span>
          <strong>{formatPrice(maxPrice)}</strong>
          <input
            type="number"
            min="350000"
            max="700000"
            step="5000"
            value={maxPrice}
            inputMode="numeric"
            onChange={(event) => setMaxPrice(Number(event.target.value))}
          />
        </label>
        <label className="hero-search__field hero-search__field--range">
          <span>Size</span>
          <strong>{maxSize.toLocaleString()} sq ft</strong>
          <input
            type="number"
            min="1500"
            max="4000"
            step="50"
            value={maxSize}
            inputMode="numeric"
            onChange={(event) => setMaxSize(Number(event.target.value))}
          />
        </label>
      </form>

      <header className="section-heading section-heading--center">
        <p className="section-heading__eyebrow">Featured registry</p>
        <h2>Selected properties</h2>
        <p>
          {filteredProperties.length} of {data.properties.length} properties match the current
          filters.
        </p>
      </header>

      <div className="property-grid">
        {filteredProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
}
