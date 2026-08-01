import type { EscrowDeal } from '../lib/escrow/types';
import type { Listing, Offer } from '../modules/marketplace/types';
import type { PriceHistoryPoint, ValuationSummary } from '../modules/land-insights/types';
import type { TransferRecord } from '../modules/ownership-history/types';
import type { Property } from '../modules/property-registry/types';
import { mockEscrowDeals } from './mockEscrowDeals';
import {
  mockListings,
  mockPriceHistory,
  mockProperties,
  mockTransferHistory,
  mockValuationSummaries,
} from './mockProperties';

export const STORAGE_KEY = 'bch-real-estate-data-v2';

export const DEMO_BUYER_PUBKEY = '02demo000000000000000000000000000000000001';

/** Demo seller — owner of prop-001 in mock data. */
export const DEMO_SELLER_PUBKEY = '02a1b2c3d4e5f6789012345678901234567890abcd';

export interface AppData {
  properties: Property[];
  listings: Listing[];
  escrowDeals: EscrowDeal[];
  transferHistory: Record<string, TransferRecord[]>;
  priceHistory: Record<string, PriceHistoryPoint[]>;
  valuationSummaries: Record<string, ValuationSummary>;
  offers: Offer[];
}

export function getDefaultAppData(): AppData {
  return {
    properties: structuredClone(mockProperties),
    listings: structuredClone(mockListings),
    escrowDeals: structuredClone(mockEscrowDeals),
    transferHistory: structuredClone(mockTransferHistory),
    priceHistory: structuredClone(mockPriceHistory),
    valuationSummaries: structuredClone(mockValuationSummaries),
    offers: [],
  };
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultAppData();

    const defaults = getDefaultAppData();
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      ...defaults,
      ...parsed,
      offers: parsed.offers ?? defaults.offers,
      escrowDeals: parsed.escrowDeals ?? defaults.escrowDeals,
    };
  } catch {
    return getDefaultAppData();
  }
}

export function saveAppData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetAppData(): AppData {
  localStorage.removeItem(STORAGE_KEY);
  return getDefaultAppData();
}

export function getPropertyById(data: AppData, id: string): Property | undefined {
  return data.properties.find((property) => property.id === id);
}

export function getEscrowDealForListing(data: AppData, listingId: string): EscrowDeal | undefined {
  return data.escrowDeals.find(
    (deal) =>
      deal.listingId === listingId &&
      deal.status !== 'completed' &&
      deal.status !== 'cancelled' &&
      deal.status !== 'mutually_closed',
  );
}
