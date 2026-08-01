import type { EscrowDeal } from '../lib/escrow/types';
import { TITLE_COMPANY_ARBITER } from '../lib/escrow/constants';

/** Mock escrow deals illustrating the 3-party payment flow. */
export const mockEscrowDeals: EscrowDeal[] = [
  {
    id: 'escrow-listing-prop-001',
    propertyId: 'prop-001',
    listingId: 'listing-prop-001',
    contractAddress: 'bitcoincash:qescrow001000000000000000000000000',
    amount: 485_000,
    parties: {
      buyerPubkey: '03buyer00100000000000000000000000000000001',
      sellerPubkey: '02a1b2c3d4e5f6789012345678901234567890abcd',
      ...TITLE_COMPANY_ARBITER,
    },
    status: 'awaiting_title_clearance',
    resolution: null,
    createdAt: '2025-01-12T10:00:00Z',
    resolvedAt: null,
    resolutionTxId: null,
  },
  {
    id: 'escrow-listing-prop-002',
    propertyId: 'prop-002',
    listingId: 'listing-prop-002',
    contractAddress: 'bitcoincash:qescrow002000000000000000000000000',
    amount: 620_000,
    parties: {
      buyerPubkey: '03buyer00200000000000000000000000000000002',
      sellerPubkey: '03fedcba0987654321098765432109876543210ef',
      ...TITLE_COMPANY_ARBITER,
    },
    status: 'funded',
    resolution: null,
    createdAt: '2024-12-10T14:30:00Z',
    resolvedAt: null,
    resolutionTxId: null,
  },
];

export function getEscrowDealForListing(listingId: string): EscrowDeal | undefined {
  return mockEscrowDeals.find((d) => d.listingId === listingId);
}
