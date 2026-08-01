import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PropertyMap } from '../../components/PropertyMap';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../context/ToastContext';
import { useWalletBalance } from '../../hooks/useWalletBalance';
import { getEscrowDealForListing } from '../../data/storage';
import {
  filterByLocation,
  toMapProperty,
  type LocationSelection,
} from '../../lib/mapUtils';
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
  const { balanceSat, noWallet } = useWalletBalance();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [locationSelection, setLocationSelection] = useState<LocationSelection | null>(null);
  const [selectedStatusFilters, setSelectedStatusFilters] = useState<string[]>([
    'with-escrow',
    'no-escrow',
    'funded',
    'awaiting_title_clearance',
  ]);
  const [maxPrice, setMaxPrice] = useState(700_000);
  const [maxSize, setMaxSize] = useState(3_500);
  // Demo BCH/USD rate used to compare the wallet balance (BCH) against the
  // USD-denominated asking price. Adjust this to model a funded buyer.
  const BCH_TO_USD_RATE = 100;
  const balanceUsd = balanceSat !== null ? (balanceSat / 100_000_000) * BCH_TO_USD_RATE : null;
  // Only gate the Buy button on balance when we actually know the balance
  // (not while loading, on error, or when no wallet is connected).
  const canAssessBalance = balanceSat !== null && !noWallet;

  const filteredListings = useMemo(
    () =>
      data.listings.filter((listing) => {
        const property = data.properties.find((item) => item.id === listing.propertyId);
        if (!property) return false;

        const sizeValue = getSizeValue(listing.size);
        const escrow = getEscrowDealForListing(data, listing.id);

        const escrowBucket = escrow ? 'with-escrow' : 'no-escrow';
        const matchesLocation =
          !locationSelection || filterByLocation([property], locationSelection).length > 0;
        const matchesStatus = selectedStatusFilters.includes(escrowBucket);
        const matchesSpecificStatus = escrow ? selectedStatusFilters.includes(escrow.status) : true;
        const matchesPrice = listing.askingPrice <= maxPrice;
        const matchesSize = sizeValue <= maxSize;

        return matchesLocation && matchesStatus && matchesSpecificStatus && matchesPrice && matchesSize;
      }),
    [data, locationSelection, maxPrice, maxSize, selectedStatusFilters],
  );

  // Get unique locations from all properties for the dropdown
  const locationOptions = useMemo(() => {
    const locations = data.properties
      .map(prop => ({
        address: prop.address,
        lat: prop.lat,
        lng: prop.lng
      }))
      .filter((item, index, self) =>
        index === self.findIndex(t =>
          t.address === item.address &&
          t.lat === item.lat &&
          t.lng === item.lng
        )
      );
    return [
      { address: 'All Locations', lat: 0, lng: 0 }, // Special option for all locations
      ...locations
    ];
  }, [data.properties]);

  const mapProperties = useMemo(
    () =>
      filteredListings.flatMap((listing) => {
        const property = data.properties.find((item) => item.id === listing.propertyId);
        if (!property) return [];
        return [
          toMapProperty(
            property,
            `${formatPrice(listing.askingPrice)} · ${listing.size}`,
          ),
        ];
      }),
    [data.properties, filteredListings],
  );

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
            <select
              id="marketplace-location"
              value={locationSelection?.address || 'All Locations'}
              onChange={(e) => {
                const selectedValue = e.target.value;
                if (selectedValue === 'All Locations') {
                  setLocationSelection(null);
                } else {
                  const selectedLocation = locationOptions.find(
                    loc => loc.address === selectedValue
                  );
                  setLocationSelection(selectedLocation || null);
                }
              }}
            >
              <option value="All Locations">All Locations</option>
              {locationOptions
                .filter(opt => opt.address !== 'All Locations')
                .map(option => (
                  <option key={option.address} value={option.address}>
                    {option.address}
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
                const sufficientFunds = canAssessBalance && balanceUsd! >= listing.askingPrice;
                const insufficientFunds = canAssessBalance && !sufficientFunds;

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
                        disabled={Boolean(escrow) || insufficientFunds}
                      >
                        Buy
                      </button>
                      {insufficientFunds && !escrow && (
                        <p className="result-card__insufficient">
                          Insufficient balance — you have {balanceUsd!.toFixed(2)} USD worth of BCH.
                        </p>
                      )}
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleMakeOffer(listing)}
                      >
                        Make Offer
                      </button>
                    </div>

                    <div className="result-card__view-actions">
                      <Link
                        className="btn btn-secondary btn-sm"
                        to={`/history?property=${encodeURIComponent(listing.propertyId)}`}
                      >
                        View land ownership
                      </Link>
                      <Link
                        className="btn btn-secondary btn-sm"
                        to={`/insights?property=${encodeURIComponent(listing.propertyId)}`}
                      >
                        Land Insights
                      </Link>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        <div className="map-panel">
          <PropertyMap
            title="Listing distribution"
            properties={mapProperties}
            center={locationSelection ?? undefined}
            highlightedId={selectedListing?.propertyId ?? null}
          />
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
