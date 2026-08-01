import type { FormEvent } from 'react';
import type { Listing } from './types';

interface OfferModalProps {
  listing: Listing;
  onClose: () => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

export function OfferModal({ listing, onClose }: OfferModalProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('TODO: wire to contract', { action: 'submitOffer', listingId: listing.id });
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id="offer-modal-title">Make an Offer</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <p className="muted">{listing.address}</p>
        <p>
          Asking price: <strong>{formatPrice(listing.askingPrice)}</strong>
        </p>

        <form className="offer-form" onSubmit={handleSubmit}>
          <label>
            Offer amount (USD)
            <input type="number" defaultValue={listing.askingPrice - 10_000} min={0} />
          </label>
          <label>
            Message to seller
            <textarea rows={3} placeholder="Optional note with your offer…" />
          </label>
          <div className="button-row">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Offer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
