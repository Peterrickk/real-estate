import { mockTransferHistory, mockPriceHistory } from '../data/mockProperties';
import {
  getEscrowTransferRecords,
  getEscrowPriceHistoryPoints,
} from '../lib/saleEvents/recordCompletedSale';
import type { TransferRecord } from '../modules/ownership-history/types';
import type { PriceHistoryPoint } from '../modules/land-insights/types';

/** Merges static mock data with escrow-completed sale records. */
export function getTransferHistoryForProperty(propertyId: string): TransferRecord[] {
  const staticRecords = mockTransferHistory[propertyId] ?? [];
  const escrowRecords = getEscrowTransferRecords().filter((r) => r.propertyId === propertyId);

  return [...staticRecords, ...escrowRecords].sort(
    (a, b) => new Date(b.dateAcquired).getTime() - new Date(a.dateAcquired).getTime(),
  );
}

export function getPriceHistoryForProperty(propertyId: string): PriceHistoryPoint[] {
  const staticPoints = mockPriceHistory[propertyId] ?? [];
  const escrowPoints = getEscrowPriceHistoryPoints().filter((p) => p.propertyId === propertyId);

  return [...staticPoints, ...escrowPoints].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}
