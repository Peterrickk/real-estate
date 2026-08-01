import { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../context/ToastContext';
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
  const { data, purchaseListing } = useAppData();
  const { showToast } = useToast();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const handleBuy = (listing: Listing) => {
    const purchased = purchaseListing(listing.id);
    if (purchased) {
      showToast(`Purchase recorded for ${listing.address}. Check Ownership History.`);
    } else {
      showToast('Unable to complete purchase.', 'info');
    }
  };

  const handleMakeOffer = (listing: Listing) => {
    setSelectedListing(listing);
  };

  return (
    <section className="page">
      <header className="page-header">
        <h1>Marketplace</h1>
        <p>Browse listed properties and interact with escrow contracts (demo mode).</p>
      </header>

      {data.listings.length === 0 ? (
        <p className="empty-state">No active listings. Reset demo data to restore listings.</p>
      ) : (
        <div className="card-grid">
          {data.listings.map((listing) => (
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
      )}

      {data.offers.length > 0 && (
        <section className="offers-section">
          <h2>Submitted Offers</h2>
          <div className="offers-list">
            {data.offers.map((offer) => {
              const listing = data.listings.find((item) => item.id === offer.listingId);
              return (
                <article key={offer.id} className="card offer-card">
                  <p>
                    <strong>{listing?.address ?? offer.propertyId}</strong>
                  </p>
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

      {selectedListing && (
        <OfferModal listing={selectedListing} onClose={() => setSelectedListing(null)} />
      )}
    </section>
  );
}
