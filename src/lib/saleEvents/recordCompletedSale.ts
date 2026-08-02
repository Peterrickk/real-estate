import type { TransferRecord } from '../../modules/ownership-history/types';
import type { PriceHistoryPoint } from '../../modules/land-insights/types';
import type { EscrowDeal } from '../escrow/types';
import type { CompletedSaleEvent } from './types';

/** In-memory store for demo; replace with indexer / API persistence later. */
const completedSales: CompletedSaleEvent[] = [];
const transferRecords: TransferRecord[] = [];
const priceHistoryPoints: PriceHistoryPoint[] = [];

export function escrowDealToSaleEvent(deal: EscrowDeal): CompletedSaleEvent | null {
  if (deal.resolution !== 'completeSale' && deal.resolution !== 'mutualClose') {
    return null;
  }
  if (!deal.resolvedAt || !deal.resolutionTxId) {
    return null;
  }

  return {
    propertyId: deal.propertyId,
    escrowId: deal.id,
    buyerPubkey: deal.parties.buyerPubkey,
    sellerPubkey: deal.parties.sellerPubkey,
    arbiterPubkey: deal.parties.arbiterPubkey,
    salePrice: deal.amount,
    completedAt: deal.resolvedAt,
    escrowTxId: deal.resolutionTxId,
    resolution: deal.resolution,
  };
}

export function saleEventToTransferRecords(event: CompletedSaleEvent): TransferRecord[] {
  const date = event.completedAt.slice(0, 10);

  return [
    {
      id: `tx-${event.escrowId}-seller-close`,
      propertyId: event.propertyId,
      owner: event.sellerPubkey,
      dateAcquired: date,
      dateSold: date,
      priceAtTime: event.salePrice,
      source: 'escrow',
      escrowTxId: event.escrowTxId,
    },
    {
      id: `tx-${event.escrowId}-buyer-acquire`,
      propertyId: event.propertyId,
      owner: event.buyerPubkey,
      dateAcquired: date,
      dateSold: null,
      priceAtTime: event.salePrice,
      source: 'escrow',
      escrowTxId: event.escrowTxId,
    },
  ];
}

export function saleEventToPriceHistoryPoint(event: CompletedSaleEvent): PriceHistoryPoint {
  return {
    date: event.completedAt.slice(0, 10),
    price: event.salePrice,
    source: 'escrow',
    escrowTxId: event.escrowTxId,
    propertyId: event.propertyId,
  };
}

/**
 * Called after completeSale() or mutualClose() confirms on-chain.
 * Produces records consumed by ownership-history and land-insights.
 */
export function recordCompletedSale(deal: EscrowDeal): CompletedSaleEvent | null {
  const event = escrowDealToSaleEvent(deal);
  if (!event) return null;

  completedSales.push(event);
  transferRecords.push(...saleEventToTransferRecords(event));
  priceHistoryPoints.push(saleEventToPriceHistoryPoint(event));

  return event;
}

export function getCompletedSales(): readonly CompletedSaleEvent[] {
  return completedSales;
}

export function getEscrowTransferRecords(): readonly TransferRecord[] {
  return transferRecords;
}

export function getEscrowPriceHistoryPoints(): readonly PriceHistoryPoint[] {
  return priceHistoryPoints;
}
