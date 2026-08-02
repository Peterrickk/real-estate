import type { FormEvent } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../context/ToastContext';
import { useDemoWallet } from '../../hooks/useDemoWallet';
import type { Listing } from './types';

interface OfferModalProps {
  listing: Listing;
  onClose: () => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(price);
}

export function OfferModal({ listing, onClose }: OfferModalProps) {
  const { addOffer } = useAppData();
  const { showToast } = useToast();
  const buyerWallet = useDemoWallet();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const offerAmount = Number(formData.get('offerAmount'));
    const message = String(formData.get('message') ?? '').trim();

    if (!buyerWallet) {
      showToast('Connect a demo wallet to make an offer.', 'info');
      return;
    }

    if (!Number.isFinite(offerAmount) || offerAmount <= 0) {
      showToast('Enter a valid offer amount.', 'info');
      return;
    }

    addOffer({
      listingId: listing.id,
      propertyId: listing.propertyId,
      offerAmount,
      message,
      buyerPubkey: buyerWallet.publicKey,
    });

    showToast(`🎉 Offer submitted for the NFT Land Certificate at ${listing.address}. If accepted, the NFT and all ownership documents will be transferred to your BCH wallet.`);
    onClose();
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
          <h2 id="offer-modal-title">Make an NFT Offer</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <p className="muted property-address property-address--inline">{listing.address}</p>
        <p>
          Asking price: <strong>{formatPrice(listing.askingPrice)}</strong>
        </p>
        <p className="muted" style={{fontSize: '0.85rem', marginTop: '0.5rem'}}>
          📜 You are making an offer on the Land Title NFT. If accepted, the NFT certificate and all ownership documents will be transferred to your BCH wallet.
        </p>

        <form className="offer-form" onSubmit={handleSubmit}>
          <label>
            Offer amount (PHP)
            <input
              type="number"
              name="offerAmount"
              defaultValue={Math.max(1, listing.askingPrice - 1)}
              min={1}
              max={5}
              step={1}
              required
            />
          </label>
          <label>
            Message to seller
            <textarea name="message" rows={3} placeholder="Optional note with your offer…" />
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
