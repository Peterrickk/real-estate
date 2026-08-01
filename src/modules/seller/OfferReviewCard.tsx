import type { Offer } from '../marketplace/types';
import { formatPrice, truncatePubkey } from './types';

interface OfferReviewCardProps {
  offer: Offer;
  address: string;
  onAccept: () => void;
  onReject: () => void;
}

export function OfferReviewCard({ offer, address, onAccept, onReject }: OfferReviewCardProps) {
  return (
    <article className="card result-card seller-offer-card">
      <div className="result-card__header">
        <div>
          <p className="result-card__eyebrow">Incoming offer</p>
          <h4 className="property-address">{address}</h4>
        </div>
        <span className="badge badge-info">Pending</span>
      </div>

      <dl className="result-card__stats">
        <div>
          <dt>Offer</dt>
          <dd className="stat-primary">{formatPrice(offer.offerAmount)}</dd>
        </div>
        <div>
          <dt>Buyer</dt>
          <dd className="ledger-data ledger-data--brass">{truncatePubkey(offer.buyerPubkey)}</dd>
        </div>
        <div>
          <dt>Submitted</dt>
          <dd>{new Date(offer.createdAt).toLocaleString()}</dd>
        </div>
      </dl>

      {offer.message && <p className="offer-message">{offer.message}</p>}

      <div className="button-row">
        <button type="button" className="btn btn-primary btn-sm" onClick={onAccept}>
          Accept
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onReject}>
          Reject
        </button>
      </div>
    </article>
  );
}
