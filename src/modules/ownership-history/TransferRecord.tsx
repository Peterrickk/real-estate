import type { TransferRecord } from './types';

interface TransferRecordProps {
  record: TransferRecord;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

function truncatePubkey(pubkey: string): string {
  return `${pubkey.slice(0, 10)}…${pubkey.slice(-8)}`;
}

export function TransferRecordRow({ record }: TransferRecordProps) {
  return (
    <article className={`transfer-row${record.source === 'escrow' ? ' transfer-row-escrow' : ''}`}>
      <div className="transfer-owner">
        <span className="label">Owner</span>
        <span className="ledger-data ledger-data--brass">{truncatePubkey(record.owner)}</span>
        {record.source === 'escrow' && <span className="badge badge-info badge-sm">Escrow</span>}
      </div>
      <div>
        <span className="label">Acquired</span>
        <span>{record.dateAcquired}</span>
      </div>
      <div>
        <span className="label">Sold</span>
        <span>{record.dateSold ?? 'Current owner'}</span>
      </div>
      <div>
        <span className="label">Price</span>
        <span>{formatPrice(record.priceAtTime)}</span>
      </div>
    </article>
  );
}
