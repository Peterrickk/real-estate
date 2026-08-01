import type { EscrowDeal } from '../../lib/escrow/types';
import { formatPrice, truncatePubkey } from './types';

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

interface SellerEscrowCardProps {
  deal: EscrowDeal;
  address: string;
  onCompleteSale: () => void;
  onMutualClose: () => void;
}

export function SellerEscrowCard({
  deal,
  address,
  onCompleteSale,
  onMutualClose,
}: SellerEscrowCardProps) {
  const canCompleteSale = deal.status === 'awaiting_title_clearance';
  const canMutualClose = deal.status === 'funded';

  return (
    <article className="card result-card seller-escrow-card">
      <div className="result-card__header">
        <div>
          <p className="result-card__eyebrow">Active escrow</p>
          <h4 className="property-address">{address}</h4>
        </div>
        <span className="badge badge-info">{escrowStatusLabel(deal.status)}</span>
      </div>

      <dl className="result-card__stats">
        <div>
          <dt>Amount</dt>
          <dd>{formatPrice(deal.amount)}</dd>
        </div>
        <div>
          <dt>Buyer</dt>
          <dd className="ledger-data ledger-data--brass">{truncatePubkey(deal.parties.buyerPubkey)}</dd>
        </div>
        <div>
          <dt>Arbiter</dt>
          <dd>{deal.parties.arbiterName}</dd>
        </div>
        {deal.contractAddress && (
          <div>
            <dt>Contract</dt>
            <dd className="ledger-data">{deal.contractAddress}</dd>
          </div>
        )}
      </dl>

      {(canCompleteSale || canMutualClose) && (
        <div className="button-row escrow-actions">
          {canCompleteSale && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onCompleteSale}
              title="Seller + title company signatures"
            >
              Complete Sale
            </button>
          )}
          {canMutualClose && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onMutualClose}
              title="Buyer + seller signatures, no arbiter"
            >
              Mutual Close
            </button>
          )}
        </div>
      )}
    </article>
  );
}
