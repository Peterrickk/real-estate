import { useState } from 'react';
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

function escrowBadgeClass(status: EscrowDeal['status']): string {
  switch (status) {
    case 'completed':
    case 'mutually_closed':
      return 'badge-success';
    case 'cancelled':
      return 'badge-muted';
    default:
      return 'badge-info';
  }
}

function truncateContract(address: string): string {
  return address.length <= 24 ? address : `${address.slice(0, 16)}…${address.slice(-8)}`;
}

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
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
  const [copied, setCopied] = useState(false);
  const canCompleteSale = deal.status === 'awaiting_title_clearance';
  const canMutualClose = deal.status === 'funded';

  const handleCopyContract = async () => {
    if (!deal.contractAddress) return;
    try {
      await navigator.clipboard.writeText(deal.contractAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable (non-secure context) — ignore.
    }
  };

  return (
    <article className="card result-card seller-escrow-card">
      <div className="result-card__header">
        <div>
          <p className="result-card__eyebrow">Active escrow</p>
          <h4 className="property-address">{address}</h4>
        </div>
        <span className={`badge ${escrowBadgeClass(deal.status)}`}>
          {escrowStatusLabel(deal.status)}
        </span>
      </div>

      <dl className="result-card__stats">
        <div>
          <dt>Amount</dt>
          <dd className="stat-primary">{formatPrice(deal.amount)}</dd>
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
            <dd>
              <div className="contract-address">
                <code className="contract-address__value">{truncateContract(deal.contractAddress)}</code>
                <button
                  type="button"
                  className="contract-address__copy"
                  onClick={handleCopyContract}
                  title={copied ? 'Copied' : 'Copy contract address'}
                  aria-label="Copy contract address"
                >
                  <CopyIcon />
                </button>
              </div>
            </dd>
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
