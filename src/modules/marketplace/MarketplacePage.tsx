import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PropertyMap } from '../../components/PropertyMap';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../context/ToastContext';
import { useWalletBalance } from '../../hooks/useWalletBalance';
import { useDemoWallet } from '../../hooks/useDemoWallet';
import { getEscrowDealForListing } from '../../data/storage';
import {
  filterByLocation,
  toMapProperty,
  type LocationSelection,
} from '../../lib/mapUtils';
import { DEMO_BCH_USD_RATE } from '../../lib/rates';
import type { EscrowDeal } from '../../lib/escrow/types';
import { OfferModal } from './OfferModal';
import type { Listing } from './types';
import type { Property } from '../property-registry/types';

const escrowStatusFilters = [
  { value: 'with-escrow', label: 'Listings with escrow' },
  { value: 'no-escrow', label: 'No escrow yet' },
  { value: 'funded', label: 'Funded' },
  { value: 'awaiting_title_clearance', label: 'Awaiting title clearance' },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
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

// NFT-style card component
function NFTPropertyCard({ listing, property, escrow, onBuy, onMakeOffer, insufficientFunds }: {
  listing: Listing;
  property: Property;
  escrow: EscrowDeal | null;
  onBuy: (listing: Listing) => void;
  onMakeOffer: (listing: Listing) => void;
  insufficientFunds: boolean;
}) {
  const propertyImages = [
    '/realestate1.jpg',
    '/realestate2.jpeg',
    '/realestate3.webp',
    '/realestate4.jpg',
    '/realestate6.jpeg',
    '/realestate7.jpg',
  ];
  const imageIndex = Math.abs(property.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) % propertyImages.length;
  const imageUrl = propertyImages[imageIndex];

  return (
    <article className="nft-property-card">
      <div className="nft-card__media">
        <img className="nft-card__image" src={imageUrl} alt={property.address} />
        <div className="nft-card__badges">
          <span className="nft-badge nft-badge--primary">🏠 LAND TITLE NFT</span>
          <span className="nft-badge nft-badge--verified">✓ Verified Property</span>
          <span className="nft-badge nft-badge--blockchain">CashTokens NFT</span>
          <span className="nft-badge nft-badge--network">On BCH Blockchain</span>
        </div>
      </div>

      <div className="nft-card__body">
        <div className="nft-card__header">
          <div className="nft-card__identity">
            <span className="nft-card__token-id">#{property.nftTokenId || property.tokenId}</span>
            <span className="nft-card__certificate-id">Cert: {property.certificateNumber || 'N/A'}</span>
          </div>
          <div className="nft-card__flags">
            <span className="flag-flag">🇵🇭</span>
            <span className="bch-logo">BCH</span>
          </div>
        </div>

        <h3 className="nft-card__property-name">{property.propertyType || 'Property'}</h3>
        <p className="nft-card__address">{property.address}</p>

        <div className="nft-card__details">
          <div className="nft-detail-item">
            <span className="nft-detail-label">Type</span>
            <span className="nft-detail-value">{property.propertyType || 'N/A'}</span>
          </div>
          <div className="nft-detail-item">
            <span className="nft-detail-label">Location</span>
            <span className="nft-detail-value">{getLocation(listing.address)}</span>
          </div>
          <div className="nft-detail-item">
            <span className="nft-detail-label">Lot Size</span>
            <span className="nft-detail-value">{listing.size}</span>
          </div>
          {property.floorArea && (
            <div className="nft-detail-item">
              <span className="nft-detail-label">Floor Area</span>
              <span className="nft-detail-value">{property.floorArea}</span>
            </div>
          )}
          {property.bedrooms && (
            <div className="nft-detail-item">
              <span className="nft-detail-label">Bedrooms</span>
              <span className="nft-detail-value">{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="nft-detail-item">
              <span className="nft-detail-label">Bathrooms</span>
              <span className="nft-detail-value">{property.bathrooms}</span>
            </div>
          )}
        </div>

        <div className="nft-card__ownership">
          <h4 className="ownership-title">Digital Ownership Includes</h4>
          <ul className="ownership-list">
            <li>✓ CashTokens NFT Land Certificate</li>
            <li>✓ Transferable Ownership NFT</li>
            <li>✓ Property Metadata</li>
            <li>✓ Ownership History</li>
            <li>✓ Blockchain Verification</li>
            <li>✓ Property Documents</li>
            <li>✓ Title Documents</li>
            <li>✓ Survey Plan</li>
            <li>✓ Tax Declaration</li>
          </ul>
          <p className="ownership-note">
            Buying this property transfers the NFT Land Certificate and all attached ownership documents to your BCH wallet.
          </p>
        </div>

        <div className="nft-card__price-section">
          <div className="price-display">
            <span className="price-label">Price</span>
            <span className="price-value">{formatPrice(listing.askingPrice)}</span>
          </div>
          <div className="nft-metadata">
            <span className="metadata-item">Token ID: {property.nftTokenId || property.tokenId}</span>
            <span className="metadata-item">Category: {property.cashTokenCategory || 'N/A'}</span>
          </div>
        </div>

        <div className="nft-card__actions">
          <button
            type="button"
            className="btn btn-primary nft-btn-buy"
            onClick={() => onBuy(listing)}
            disabled={Boolean(escrow) || insufficientFunds}
          >
            Buy NFT Property
          </button>
          {insufficientFunds && !escrow && (
            <p className="nft-card__insufficient">
              Insufficient balance
            </p>
          )}
          <button
            type="button"
            className="btn btn-secondary nft-btn-offer"
            onClick={() => onMakeOffer(listing)}
          >
            Make Offer
          </button>
        </div>

        <div className="nft-card__links">
          <Link
            className="nft-link"
            to={`/history?property=${encodeURIComponent(listing.propertyId)}`}
          >
            View NFT Certificate
          </Link>
          <Link
            className="nft-link"
            to={`/history?property=${encodeURIComponent(listing.propertyId)}`}
          >
            View Ownership Documents
          </Link>
          <Link
            className="nft-link"
            to={`/insights?property=${encodeURIComponent(listing.propertyId)}`}
          >
            View Blockchain Record
          </Link>
          <Link
            className="nft-link"
            to={`/history?property=${encodeURIComponent(listing.propertyId)}`}
          >
            View Property History
          </Link>
        </div>

        {escrow && (
          <div className="nft-card__escrow">
            <span className="escrow-badge">Escrow Protected</span>
            <p className="escrow-detail">
              Status: {escrowStatusLabel(escrow.status)} · Arbiter: {escrow.parties.arbiterName}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

export function MarketplacePage() {
  const { data, startEscrowFromBuy } = useAppData();
  const { showToast } = useToast();
  const { balanceSat, noWallet } = useWalletBalance();
  const buyerWallet = useDemoWallet();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [locationSelection, setLocationSelection] = useState<LocationSelection | null>(null);
  const [selectedStatusFilters, setSelectedStatusFilters] = useState<string[]>([
    'with-escrow',
    'no-escrow',
    'funded',
    'awaiting_title_clearance',
  ]);
  const [maxPrice, setMaxPrice] = useState(5);
  const [maxSize, setMaxSize] = useState(3_500);
  // Demo BCH/PHP rate used to compare the wallet balance (BCH) against the
  // PHP-denominated asking price. Adjust this to model a funded buyer.
  const balancePhp = balanceSat !== null ? (balanceSat / 100_000_000) * DEMO_BCH_USD_RATE : null;
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
    if (!buyerWallet) {
      showToast('Connect a demo wallet to buy.', 'info');
      return;
    }

    const deal = await startEscrowFromBuy(listing.id, buyerWallet.publicKey);
    if (deal) {
      const property = data.properties.find((item) => item.id === listing.propertyId);
      const propertyName = property?.propertyType || 'property';
      
      showToast(
        deal.status === 'funded'
          ? `🎉 Purchase initiated! You are buying the ${propertyName} NFT Land Certificate. The NFT and all ownership documents will be transferred to your BCH wallet upon completion. Seller can manage the escrow in Seller Dashboard.`
          : `🎉 Purchase initiated! You are buying the ${propertyName} NFT Land Certificate. The NFT and all ownership documents will be transferred to your BCH wallet upon completion. Seller can manage the escrow in Seller Dashboard.`,
      );
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

      <div className="dashboard-grid marketplace-layout">
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
              type="range"
              min="1"
              max="5"
              step="1"
              value={maxPrice}
              onChange={(event) => setMaxPrice(Number(event.target.value))}
              className="range-input"
              style={{
                background: `linear-gradient(to right, #2f5644 ${((maxPrice - 1) / (5 - 1)) * 100}%, #ece5db ${((maxPrice - 1) / (5 - 1)) * 100}%)`,
              }}
            />
          </label>

          <label className="filter-field range-field">
            <span>Size</span>
            <strong>{maxSize.toLocaleString()} sq ft</strong>
            <input
              type="range"
              min="1500"
              max="4000"
              step="50"
              value={maxSize}
              onChange={(event) => setMaxSize(Number(event.target.value))}
              className="range-input"
              style={{
                background: `linear-gradient(to right, #2f5644 ${((maxSize - 1500) / (4000 - 1500)) * 100}%, #ece5db ${((maxSize - 1500) / (4000 - 1500)) * 100}%)`,
              }}
            />
          </label>
        </aside>

        <div className="results-panel">
          <div className="results-panel__header">
            <h3>{filteredListings.length} active listings</h3>
          </div>

          <div className="results-stack nft-horizontal-scroll">
            {filteredListings.length === 0 ? (
              <p className="empty-state">No active listings match the current filters.</p>
            ) : (
              filteredListings.map((listing) => {
                const property = data.properties.find((item) => item.id === listing.propertyId);
                if (!property) return null;

                const escrow = getEscrowDealForListing(data, listing.id);
                const sufficientFunds = canAssessBalance && balancePhp! >= listing.askingPrice;
                const insufficientFunds = canAssessBalance && !sufficientFunds;

                return (
                  <NFTPropertyCard
                    key={listing.id}
                    listing={listing}
                    property={property}
                    escrow={escrow}
                    onBuy={handleBuy}
                    onMakeOffer={handleMakeOffer}
                    insufficientFunds={insufficientFunds}
                  />
                );
              })
            )}
          </div>
        </div>

        <div className="map-panel marketplace-map-panel">
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
