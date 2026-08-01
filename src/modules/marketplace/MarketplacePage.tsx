import { useState } from 'react';
import { mockListings } from '../../data/mockProperties';
import type { Listing } from './types';
import { OfferModal } from './OfferModal';

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

export function MarketplacePage() {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const handleBuy = (listing: Listing) => {
    console.log('TODO: wire to contract', { action: 'buy', listingId: listing.id });
  };

  const handleMakeOffer = (listing: Listing) => {
    setSelectedListing(listing);
  };

  return (
    <section className="page">
      <header className="page-header">
        <h1>Marketplace</h1>
        <p>Browse listed properties and interact with escrow contracts (coming soon).</p>
      </header>

      <div className="card-grid">
        {mockListings.map((listing) => (
          <article key={listing.id} className="card marketplace-card">
            <h3>{listing.address}</h3>
            <p className="muted">{listing.size}</p>
            <p className="price">{formatPrice(listing.askingPrice)}</p>
            <p className="muted">Seller: {truncatePubkey(listing.sellerPubkey)}</p>
            <p className="muted">Listed: {listing.listedAt}</p>
            <div className="button-row">
              <button type="button" className="btn btn-primary" onClick={() => handleBuy(listing)}>
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
        ))}
      </div>

      {selectedListing && (
        <OfferModal listing={selectedListing} onClose={() => setSelectedListing(null)} />
      )}
    </section>
  );
}
