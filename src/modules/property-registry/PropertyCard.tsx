import type { Property } from './types';

interface PropertyCardProps {
  property: Property;
}

function formatPrice(price: number | null): string {
  if (price === null) return 'Not listed';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <article
      className={`card property-card${property.tokenized ? ' property-card--tokenized' : ''}`}
    >
      <div className="property-card__info">
        <h3 className="property-address">{property.address}</h3>
        <dl className="detail-list detail-list--prose">
          <div>
            <dt>Size</dt>
            <dd>{property.size}</dd>
          </div>
          <div>
            <dt>Listed price</dt>
            <dd>{formatPrice(property.listedPrice)}</dd>
          </div>
        </dl>
        {!property.tokenized && <p className="status-untokenized">Not tokenized</p>}
      </div>

      <div className="property-card__chain" aria-label="On-chain record">
        {property.tokenized && (
          <div className="token-seal" aria-hidden="true">
            <svg className="token-seal__svg" viewBox="0 0 80 80" width="72" height="72">
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              <circle cx="40" cy="40" r="28" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
            <span className="token-seal__text">Tokenized</span>
          </div>
        )}
        <dl className="detail-list detail-list--ledger">
          <div>
            <dt>ID</dt>
            <dd className="ledger-data">{property.id}</dd>
          </div>
          <div>
            <dt>Legal ID</dt>
            <dd className="ledger-data ledger-data--brass">{property.legalId}</dd>
          </div>
          <div>
            <dt>Token ID</dt>
            <dd className="ledger-data ledger-data--brass">{property.tokenId || '—'}</dd>
          </div>
          <div>
            <dt>Date tokenized</dt>
            <dd className="ledger-data">{property.dateTokenized || '—'}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
