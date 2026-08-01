import type { EscrowDeal } from '../lib/escrow/types';
import { ESCROW_FEE_BUFFER_SATS, TITLE_COMPANY_ARBITER } from '../lib/escrow/constants';
import { getContractAddressForParties, mockTxid } from '../lib/escrow/mockNetwork';
import { DEMO_BUYER_PUBKEY, DEMO_SELLER_PUBKEY } from '../lib/ownerKeys';
import { usdToSats } from '../lib/rates';

const amount = 485_000;
const amountSats = usdToSats(amount);

/**
 * Seed escrow deal for prop-001, backed by a real `PropertySaleEscrow`
 * contract (address derived from the compiled artifact + demo keypairs).
 * It is already funded + awaiting title clearance so the seller dashboard can
 * demo `completeSale` (seller + title company signatures) immediately.
 */
export const mockEscrowDeals: EscrowDeal[] = [
  {
    id: 'escrow-listing-prop-001',
    propertyId: 'prop-001',
    listingId: 'listing-prop-001',
    contractAddress: getContractAddressForParties({
      buyerPubkey: DEMO_BUYER_PUBKEY,
      sellerPubkey: DEMO_SELLER_PUBKEY,
      ...TITLE_COMPANY_ARBITER,
    }),
    amount,
    amountSats,
    fundedSats: amountSats + Number(ESCROW_FEE_BUFFER_SATS),
    fundingTxId: mockTxid('seed-fund:escrow-listing-prop-001'),
    parties: {
      buyerPubkey: DEMO_BUYER_PUBKEY,
      sellerPubkey: DEMO_SELLER_PUBKEY,
      ...TITLE_COMPANY_ARBITER,
    },
    status: 'awaiting_title_clearance',
    resolution: null,
    createdAt: '2025-01-12T10:00:00Z',
    resolvedAt: null,
    resolutionTxId: null,
  },
];

export function getEscrowDealForListing(listingId: string): EscrowDeal | undefined {
  return mockEscrowDeals.find((d) => d.listingId === listingId);
}
