import type { EscrowResolution } from '../escrow/types';

/**
 * Emitted when an escrow resolves with funds released to the seller.
 * This is the integration point between marketplace escrow and the
 * ownership-history / land-insights modules.
 *
 * Property token transfers are handled separately by the registry module.
 */
export interface CompletedSaleEvent {
  propertyId: string;
  escrowId: string;
  buyerPubkey: string;
  sellerPubkey: string;
  /** Title company that co-signed the release. */
  arbiterPubkey: string;
  salePrice: number;
  completedAt: string;
  escrowTxId: string;
  resolution: Extract<EscrowResolution, 'completeSale' | 'mutualClose'>;
}
