import { useMemo, useState } from 'react';
import { ResultMap } from '../../components/ResultMap';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../context/ToastContext';
import { getEscrowDealForListing } from '../../data/storage';
import type { EscrowDeal } from '../../lib/escrow/types';
import { OfferModal } from './OfferModal';
import type { Listing } from './types';

const escrowStatusFilters = [
  { value: 'with-escrow', label: 'Listings with escrow' },
  { value: 'no-escrow', label: 'No escrow yet' },
  { value: 'funded', label: 'Funded' },
  { value: 'awaiting_title_clearance', label: 'Awaiting title clearance' },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

function truncatePubkey(pubkey: string): string {
  return `${pubkey.slice(0, 8)}…${pubkey.slice(-6)}`;
}

function getLocation(address: string): string {
  return address.split(', ').slice(1).join(', ');
}

function getSizeValue(size: string): number {
  return Number.parseInt(size.replace(/[^\d]/g, ''), 10) || 0;
}

function escrowStatusLabel(status: EscrowDeal['status']): string {
  switch (status) {
    case 'pending_funding':
      return 'Pending funding';
    case 'funded':
      return 'Escrow funded';
    case 'awaiting_title_clearance':
      return 'Awaiting title';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'mutually_closed':
      return 'Mutual close';
  }
}

function toggleFilterValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function MarketplacePage() {
  const { data, startEscrowFromBuy } = useAppData();
  const { showToast } = useToast();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [locationFilter, setLocationFilter] = useState('all');
  const [selectedStatusFilters, setSelectedStatusFilters] = useState<string[]>([
    'with-escrow',
    'no-escrow',
    'funded',
    'awaiting_title_clearance',
  ]);
  const [maxPrice, setMaxPrice] = useState(700_000);
  const [maxSize, setMaxSize] = useState(3_500);

  const locations = useMemo(
    () => Array.from(new Set(data.listings.map((listing) => getLocation(listing.address)))),
    [data.listings],
  );

  const filteredListings = useMemo(
    () =>
      data.listings.filter((listing) => {
        const location = getLocation(listing.address);
        const sizeValue = getSizeValue(listing.size);
        const escrow = getEscrowDealForListing(data, listing.id);

        const escrowBucket = escrow ? 'with-escrow' : 'no-escrow';
        const matchesLocation = locationFilter === 'all' || location === locationFilter;
        const matchesStatus = selectedStatusFilters.includes(escrowBucket);
        const matchesSpecificStatus = escrow ? selectedStatusFilters.includes(escrow.status) : true;
        const matchesPrice = listing.askingPrice <= maxPrice;
        const matchesSize = sizeValue <= maxSize;

        return matchesLocation && matchesStatus && matchesSpecificStatus && matchesPrice && matchesSize;
      }),
    [data, locationFilter, maxPrice, maxSize, selectedStatusFilters],
  );

  const mapItems = filteredListings.map((listing) => ({
    id: listing.id,
    title: listing.address,
    subtitle: `${formatPrice(listing.askingPrice)} · ${listing.size}`,
    highlighted: selectedListing?.id === listing.id,
  }));

  const handleBuy = async (listing: Listing) => {
    const deal = await startEscrowFromBuy(listing.id);
    if (deal) {
      showToast(`Escrow started for ${listing.address}. Seller can manage it in Seller Dashboard.`);
    } else {
      showToast('Unable to start escrow.', 'info');
    }
  };

  const handleMakeOffer = (listing: Listing) => {
    setSelectedListing(listing);
  };

  return (
    <section className="dashboard-page">
      <header className="page-intro">
        <h2>Marketplace</h2>
      </header>

      <div className="dashboard-grid">
        <aside className="filters-panel card">
          <h3>Filters</h3>
          <label className="filter-field">
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

          <div className="filter-group">
            <span>Escrow status</span>
            <div className="checkbox-list">
              {escrowStatusFilters.map((option) => (
                <label key={option.value} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={selectedStatusFilters.includes(option.value)}
                    onChange={() =>
                      setSelectedStatusFilters((current) => toggleFilterValue(current, option.value))
                    }
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <label className="filter-field range-field">
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

          <label className="filter-field range-field">
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
        </aside>

        <div className="results-panel">
          <div className="results-panel__header">
            <h3>{filteredListings.length} active listings</h3>
          </div>

          <div className="results-stack">
            {filteredListings.length === 0 ? (
              <p className="empty-state">No active listings match the current filters.</p>
            ) : (
              filteredListings.map((listing) => {
                const escrow = getEscrowDealForListing(data, listing.id);

                return (
                  <article key={listing.id} className="card result-card">
                    <div className="result-card__header">
                      <div>
                        <p className="result-card__eyebrow">{getLocation(listing.address)}</p>
                        <h4>{listing.address}</h4>
                      </div>
                      <span className={escrow ? 'badge badge-info' : 'badge badge-muted'}>
                        {escrow ? escrowStatusLabel(escrow.status) : 'No escrow'}
                      </span>
                    </div>

                    <dl className="result-card__stats">
                      <div>
                        <dt>Ask</dt>
                        <dd>{formatPrice(listing.askingPrice)}</dd>
                      </div>
                      <div>
                        <dt>Size</dt>
                        <dd>{listing.size}</dd>
                      </div>
                      <div>
                        <dt>Listed</dt>
                        <dd>{listing.listedAt}</dd>
                      </div>
                      <div>
                        <dt>Seller</dt>
                        <dd className="ledger-data ledger-data--brass">{truncatePubkey(listing.sellerPubkey)}</dd>
                      </div>
                    </dl>

                    {escrow && (
                      <p className="muted escrow-detail">
                        Escrow active · Arbiter: {escrow.parties.arbiterName}
                        {escrow.contractAddress ? ` · ${escrow.contractAddress}` : ''}
                      </p>
                    )}

                    <div className="button-row">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleBuy(listing)}
                        disabled={Boolean(escrow)}
                      >
                        Buy
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleMakeOffer(listing)}
                      >
                        Make Offer
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        <div className="map-panel">
          <ResultMap title="Listing distribution" items={mapItems} />
        </div>
      </div>

      {data.offers.length > 0 && (
        <section className="offers-section">
          <h3>Your submitted offers</h3>
          <div className="results-stack">
            {data.offers.map((offer) => {
              const listing = data.listings.find((item) => item.id === offer.listingId);
              return (
                <article key={offer.id} className="card result-card">
                  <p className="property-address">{listing?.address ?? offer.propertyId}</p>
                  <p className="muted">
                    {formatPrice(offer.offerAmount)} · {offer.status} ·{' '}
                    {new Date(offer.createdAt).toLocaleString()}
                  </p>
                  {offer.message && <p className="offer-message">{offer.message}</p>}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {selectedListing && <OfferModal listing={selectedListing} onClose={() => setSelectedListing(null)} />}
    </section>
  );
}
