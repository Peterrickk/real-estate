import type { Listing } from '../../modules/marketplace/types';
import type { EscrowDeal, EscrowResolution } from './types';
import { TITLE_COMPANY_ARBITER } from './constants';
import { recordCompletedSale } from '../saleEvents/recordCompletedSale';

/**
 * Escrow service stubs — wire to CashScript SDK + ElectrumNetworkProvider later.
 *
 * Flow (payment only, no token logic):
 *   1. Buyer accepts listing → createEscrowDeal()
 *   2. Buyer funds escrow UTXO at contractAddress
 *   3. Title company clears title → completeSale() OR parties agree → mutualClose()
 *   4. On completion → recordCompletedSale() feeds ownership-history & land-insights
 */

export async function createEscrowDeal(listing: Listing, buyerPubkey: string): Promise<EscrowDeal> {
  console.log('TODO: wire to contract', {
    action: 'createEscrowDeal',
    listingId: listing.id,
    buyerPubkey,
  });

  return {
    id: `escrow-${listing.id}-${Date.now()}`,
    propertyId: listing.propertyId,
    listingId: listing.id,
    contractAddress: null,
    amount: listing.askingPrice,
    parties: {
      buyerPubkey,
      sellerPubkey: listing.sellerPubkey,
      ...TITLE_COMPANY_ARBITER,
    },
    status: 'pending_funding',
    resolution: null,
    createdAt: new Date().toISOString(),
    resolvedAt: null,
    resolutionTxId: null,
  };
}

export async function fundEscrow(deal: EscrowDeal): Promise<EscrowDeal> {
  console.log('TODO: wire to contract', { action: 'fundEscrow', escrowId: deal.id });
  return {
    ...deal,
    status: 'funded',
    contractAddress: 'bitcoincash:qescrow000000000000000000000000000',
  };
}

export async function completeSale(deal: EscrowDeal): Promise<EscrowDeal> {
  console.log('TODO: wire to contract', {
    action: 'completeSale',
    escrowId: deal.id,
    signers: ['seller', 'arbiter'],
  });
  return resolveEscrow(deal, 'completeSale');
}

export async function cancelSale(deal: EscrowDeal): Promise<EscrowDeal> {
  console.log('TODO: wire to contract', {
    action: 'cancelSale',
    escrowId: deal.id,
    signers: ['buyer', 'arbiter'],
  });
  return {
    ...deal,
    status: 'cancelled',
    resolution: 'cancelSale',
    resolvedAt: new Date().toISOString(),
  };
}

export async function mutualClose(deal: EscrowDeal): Promise<EscrowDeal> {
  console.log('TODO: wire to contract', {
    action: 'mutualClose',
    escrowId: deal.id,
    signers: ['buyer', 'seller'],
  });
  return resolveEscrow(deal, 'mutualClose');
}

function resolveEscrow(deal: EscrowDeal, resolution: EscrowResolution): EscrowDeal {
  const resolved: EscrowDeal = {
    ...deal,
    status: resolution === 'mutualClose' ? 'mutually_closed' : 'completed',
    resolution,
    resolvedAt: new Date().toISOString(),
    resolutionTxId: `mock-tx-${deal.id}`,
  };

  recordCompletedSale(resolved);
  return resolved;
}
