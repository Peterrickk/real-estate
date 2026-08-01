import type { EscrowDeal } from '../lib/escrow/types';
import type { Listing, Offer } from '../modules/marketplace/types';
import type { PriceHistoryPoint, ValuationSummary } from '../modules/land-insights/types';
import type { TransferRecord } from '../modules/ownership-history/types';
import type { FiatDeposit } from '../modules/funding/types';
import type { Property } from '../modules/property-registry/types';
import { DEMO_BUYER_PUBKEY, DEMO_SELLER_PUBKEY } from '../lib/ownerKeys';
import { mockEscrowDeals } from './mockEscrowDeals';
import {
  mockListings,
  mockPriceHistory,
  mockProperties,
  mockTransferHistory,
  mockValuationSummaries,
} from './mockProperties';

// Re-exported so existing callers keep importing from the data layer.
export { DEMO_BUYER_PUBKEY, DEMO_SELLER_PUBKEY };

/**
 * v3: escrow deals are now backed by the real PropertySaleEscrow contract and
 * demo identities use the actual chipnet demo keypairs — stale v2 app data is
 * intentionally discarded rather than migrated.
 */
export const STORAGE_KEY = 'bch-real-estate-data-v3';

export interface AppData {
  properties: Property[];
  listings: Listing[];
  escrowDeals: EscrowDeal[];
  transferHistory: Record<string, TransferRecord[]>;
  priceHistory: Record<string, PriceHistoryPoint[]>;
  valuationSummaries: Record<string, ValuationSummary>;
  offers: Offer[];
  deposits: FiatDeposit[];
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
    deposits: [],
  };
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultAppData();

    const defaults = getDefaultAppData();
    const parsed = JSON.parse(raw) as Partial<AppData>;

    const properties = (parsed.properties ?? defaults.properties).map((property) => {
      const fallback = defaults.properties.find((item) => item.id === property.id);
      return fallback
        ? {
            ...fallback,
            ...property,
            lat: property.lat ?? fallback.lat,
            lng: property.lng ?? fallback.lng,
            hazard: property.hazard ?? fallback.hazard,
          }
        : property;
    });

    return {
      ...defaults,
      ...parsed,
      properties,
      offers: parsed.offers ?? defaults.offers,
      escrowDeals: parsed.escrowDeals ?? defaults.escrowDeals,
      deposits: parsed.deposits ?? defaults.deposits,
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
