import type { Listing, Offer } from '../modules/marketplace/types';
import type { PriceHistoryPoint, ValuationSummary } from '../modules/land-insights/types';
import type { TransferRecord } from '../modules/ownership-history/types';
import type { Property } from '../modules/property-registry/types';
import {
  mockListings,
  mockPriceHistory,
  mockProperties,
  mockTransferHistory,
  mockValuationSummaries,
} from './mockProperties';

export const STORAGE_KEY = 'bch-real-estate-data';

export const DEMO_BUYER_PUBKEY = '02demo000000000000000000000000000000000001';

export interface AppData {
  properties: Property[];
  listings: Listing[];
  transferHistory: Record<string, TransferRecord[]>;
  priceHistory: Record<string, PriceHistoryPoint[]>;
  valuationSummaries: Record<string, ValuationSummary>;
  offers: Offer[];
}

export function getDefaultAppData(): AppData {
  return {
    properties: structuredClone(mockProperties),
    listings: structuredClone(mockListings),
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

    const parsed = JSON.parse(raw) as AppData;
    return {
      ...getDefaultAppData(),
      ...parsed,
      offers: parsed.offers ?? [],
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
