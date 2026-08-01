import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEMO_SELLER_PUBKEY,
  getPropertyById,
  loadAppData,
  resetAppData,
  saveAppData,
  type AppData,
} from '../data/storage';
import { completeSale, createEscrowDeal, fundEscrow, mutualClose } from '../lib/escrow';
import type { EscrowDeal } from '../lib/escrow/types';
import { DEMO_BCH_USD_RATE, FUNDING_METHODS } from '../lib/rates';
import type { FiatDeposit } from '../modules/funding/types';
import type { Listing, Offer } from '../modules/marketplace/types';

interface SubmitOfferInput {
  listingId: string;
  propertyId: string;
  offerAmount: number;
  message: string;
  /** Buyer's chipnet pubkey — the escrow contract embeds this exact key. */
  buyerPubkey: string;
}

interface AddDepositInput {
  email: string;
  method: 'bank' | 'card';
  fiatAmount: number;
  grossSats: number;
  feeSats: number;
  creditedSats: number;
}

type OfferResponse = 'accepted' | 'rejected';

interface AppDataContextValue {
  data: AppData;
  addOffer: (input: SubmitOfferInput) => Offer;
  addDeposit: (input: AddDepositInput) => FiatDeposit;
  startEscrowFromBuy: (listingId: string, buyerPubkey: string) => Promise<EscrowDeal | null>;
  getSellerProperties: () => import('../modules/property-registry/types').Property[];
  getSellerListings: () => Listing[];
  getSellerOffers: () => Offer[];
  getSellerEscrows: () => EscrowDeal[];
  createListing: (propertyId: string, askingPrice: number) => boolean;
  updateListingPrice: (listingId: string, askingPrice: number) => boolean;
  delistProperty: (listingId: string) => boolean;
  respondToOffer: (offerId: string, response: OfferResponse) => Promise<boolean>;
  resolveEscrow: (escrowId: string, action: 'completeSale' | 'mutualClose') => Promise<boolean>;
  resetData: () => void;
  getPropertyById: (id: string) => ReturnType<typeof getPropertyById>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

const ACTIVE_ESCROW_STATUSES: EscrowDeal['status'][] = [
  'pending_funding',
  'funded',
  'awaiting_title_clearance',
];

function createOfferId(): string {
  return `offer-${Date.now()}`;
}

function createDepositId(): string {
  return `dep-${Date.now()}`;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function applyEscrowCompletion(current: AppData, resolvedDeal: EscrowDeal): AppData {
  const property = current.properties.find((item) => item.id === resolvedDeal.propertyId);
  if (!property) return current;

  const purchaseDate = resolvedDeal.resolvedAt?.slice(0, 10) ?? todayIsoDate();
  const previousOwner = property.ownerPubkey;
  const buyerPubkey = resolvedDeal.parties.buyerPubkey;
  const history = current.transferHistory[property.id] ?? [];

  const updatedHistory = history.map((record) =>
    record.owner === previousOwner && record.dateSold === null
      ? {
          ...record,
          dateSold: purchaseDate,
          source: 'escrow' as const,
          escrowTxId: resolvedDeal.resolutionTxId ?? undefined,
        }
      : record,
  );

  updatedHistory.unshift({
    id: `tx-${resolvedDeal.id}-buyer`,
    propertyId: property.id,
    owner: buyerPubkey,
    dateAcquired: purchaseDate,
    dateSold: null,
    priceAtTime: resolvedDeal.amount,
    source: 'escrow',
    escrowTxId: resolvedDeal.resolutionTxId ?? undefined,
  });

  const updatedPriceHistory = [
    ...(current.priceHistory[property.id] ?? []),
    {
      date: purchaseDate,
      price: resolvedDeal.amount,
      source: 'escrow' as const,
      escrowTxId: resolvedDeal.resolutionTxId ?? undefined,
      propertyId: property.id,
    },
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    ...current,
    properties: current.properties.map((item) =>
      item.id === property.id
        ? { ...item, ownerPubkey: buyerPubkey, listedPrice: null }
        : item,
    ),
    listings: current.listings.filter((item) => item.id !== resolvedDeal.listingId),
    escrowDeals: current.escrowDeals.map((item) =>
      item.id === resolvedDeal.id ? resolvedDeal : item,
    ),
    transferHistory: {
      ...current.transferHistory,
      [property.id]: updatedHistory,
    },
    priceHistory: {
      ...current.priceHistory,
      [property.id]: updatedPriceHistory,
    },
  };
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadAppData());

  useEffect(() => {
    saveAppData(data);
  }, [data]);

  // Advance "processing" deposits to "completed" once their (simulated)
  // funding delay elapses — bank transfers take ~30s in the demo, cards
  // are credited instantly at creation.
  useEffect(() => {
    const timers: number[] = [];

    for (const deposit of data.deposits) {
      if (deposit.status !== 'processing') continue;
      const delayMs = FUNDING_METHODS[deposit.method].processingDelayMs;
      if (delayMs === null) continue;

      const elapsed = Date.now() - new Date(deposit.createdAt).getTime();
      const remaining = Math.max(0, delayMs - elapsed);
      const timerId = window.setTimeout(() => {
        setData((current) => ({
          ...current,
          deposits: current.deposits.map((item) =>
            item.id === deposit.id
              ? { ...item, status: 'completed' as const, completedAt: new Date().toISOString() }
              : item,
          ),
        }));
      }, remaining);
      timers.push(timerId);
    }

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [data.deposits]);

  const addOffer = useCallback((input: SubmitOfferInput): Offer => {
    const offer: Offer = {
      id: createOfferId(),
      listingId: input.listingId,
      propertyId: input.propertyId,
      offerAmount: input.offerAmount,
      buyerPubkey: input.buyerPubkey,
      message: input.message,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    setData((current) => ({
      ...current,
      offers: [offer, ...current.offers],
    }));

    return offer;
  }, []);

  const addDeposit = useCallback((input: AddDepositInput): FiatDeposit => {
    const instant = FUNDING_METHODS[input.method].processingDelayMs === null;
    const now = new Date().toISOString();
    const deposit: FiatDeposit = {
      id: createDepositId(),
      email: input.email,
      method: input.method,
      fiatAmount: input.fiatAmount,
      fiatCurrency: 'USD',
      grossSats: input.grossSats,
      feeSats: input.feeSats,
      creditedSats: input.creditedSats,
      remainingSats: input.creditedSats,
      rateBchPerUsd: DEMO_BCH_USD_RATE,
      status: instant ? 'completed' : 'processing',
      createdAt: now,
      completedAt: instant ? now : null,
    };

    setData((current) => ({
      ...current,
      deposits: [deposit, ...current.deposits],
    }));

    return deposit;
  }, []);

  const startEscrowFromBuy = useCallback(
    async (listingId: string, buyerPubkey: string): Promise<EscrowDeal | null> => {
      const current = data;
      const listing = current.listings.find((item) => item.id === listingId);
      if (!listing) return null;

      const existing = current.escrowDeals.find(
        (deal) => deal.listingId === listingId && ACTIVE_ESCROW_STATUSES.includes(deal.status),
      );
      if (existing) return existing;

      // Deploy the PropertySaleEscrow contract for this deal (address derived
      // from the artifact + the parties' pubkeys; no broadcast needed).
      const deal = await createEscrowDeal(listing, buyerPubkey);

      // Fund the escrow from the buyer's completed deposits when possible.
      const funded = await fundEscrow(data, deal);
      const persistedDeal = funded?.deal ?? deal;

      setData((prev) => ({
        ...prev,
        escrowDeals: [persistedDeal, ...prev.escrowDeals],
        deposits: funded?.deposits ?? prev.deposits,
        listings: prev.listings.map((item) =>
          item.id === listingId ? { ...item, escrowId: persistedDeal.id } : item,
        ),
      }));

      return persistedDeal;
    },
    [data],
  );

  const getSellerProperties = useCallback(
    () => data.properties.filter((property) => property.ownerPubkey === DEMO_SELLER_PUBKEY),
    [data.properties],
  );

  const getSellerListings = useCallback(
    () => data.listings.filter((listing) => listing.sellerPubkey === DEMO_SELLER_PUBKEY),
    [data.listings],
  );

  const getSellerOffers = useCallback(() => {
    const sellerListingIds = new Set(getSellerListings().map((listing) => listing.id));
    return data.offers.filter(
      (offer) => sellerListingIds.has(offer.listingId) && offer.status === 'pending',
    );
  }, [data.offers, getSellerListings]);

  const getSellerEscrows = useCallback(
    () =>
      data.escrowDeals.filter(
        (deal) =>
          deal.parties.sellerPubkey === DEMO_SELLER_PUBKEY &&
          ACTIVE_ESCROW_STATUSES.includes(deal.status),
      ),
    [data.escrowDeals],
  );

  const createListing = useCallback((propertyId: string, askingPrice: number): boolean => {
    let created = false;

    setData((current) => {
      const property = current.properties.find((item) => item.id === propertyId);
      if (
        !property ||
        property.ownerPubkey !== DEMO_SELLER_PUBKEY ||
        !property.tokenized ||
        current.listings.some((listing) => listing.propertyId === propertyId)
      ) {
        return current;
      }

      created = true;
      const listing: Listing = {
        id: `listing-${propertyId}`,
        propertyId,
        address: property.address,
        size: property.size,
        askingPrice,
        sellerPubkey: DEMO_SELLER_PUBKEY,
        listedAt: todayIsoDate(),
      };

      return {
        ...current,
        properties: current.properties.map((item) =>
          item.id === propertyId ? { ...item, listedPrice: askingPrice } : item,
        ),
        listings: [...current.listings, listing],
      };
    });

    return created;
  }, []);

  const updateListingPrice = useCallback((listingId: string, askingPrice: number): boolean => {
    let updated = false;

    setData((current) => {
      const listing = current.listings.find((item) => item.id === listingId);
      if (!listing || listing.sellerPubkey !== DEMO_SELLER_PUBKEY) return current;

      updated = true;
      return {
        ...current,
        properties: current.properties.map((item) =>
          item.id === listing.propertyId ? { ...item, listedPrice: askingPrice } : item,
        ),
        listings: current.listings.map((item) =>
          item.id === listingId ? { ...item, askingPrice } : item,
        ),
      };
    });

    return updated;
  }, []);

  const delistProperty = useCallback((listingId: string): boolean => {
    let removed = false;

    setData((current) => {
      const listing = current.listings.find((item) => item.id === listingId);
      if (!listing || listing.sellerPubkey !== DEMO_SELLER_PUBKEY) return current;

      removed = true;
      return {
        ...current,
        properties: current.properties.map((item) =>
          item.id === listing.propertyId ? { ...item, listedPrice: null } : item,
        ),
        listings: current.listings.filter((item) => item.id !== listingId),
      };
    });

    return removed;
  }, []);

  const respondToOffer = useCallback(
    async (offerId: string, response: OfferResponse): Promise<boolean> => {
      if (response === 'rejected') {
        let rejected = false;
        setData((current) => {
          const offer = current.offers.find((item) => item.id === offerId);
          if (!offer || offer.status !== 'pending') return current;
          rejected = true;
          return {
            ...current,
            offers: current.offers.map((item) =>
              item.id === offerId ? { ...item, status: 'rejected' } : item,
            ),
          };
        });
        return rejected;
      }

      const current = data;
      const offer = current.offers.find((item) => item.id === offerId);
      if (!offer || offer.status !== 'pending') return false;

      const listing = current.listings.find((item) => item.id === offer.listingId);
      if (!listing || listing.sellerPubkey !== DEMO_SELLER_PUBKEY) return false;

      const existingEscrow = current.escrowDeals.find(
        (deal) => deal.listingId === listing.id && ACTIVE_ESCROW_STATUSES.includes(deal.status),
      );
      if (existingEscrow) return false;

      // Deploy the contract for the agreed price, then fund from the buyer's
      // completed deposits when possible.
      const deal = await createEscrowDeal(listing, offer.buyerPubkey, offer.offerAmount);
      const funded = await fundEscrow(data, deal);
      const persistedDeal = funded?.deal ?? deal;

      let accepted = false;
      setData((prev) => {
        const currentOffer = prev.offers.find((item) => item.id === offerId);
        if (!currentOffer || currentOffer.status !== 'pending') return prev;
        accepted = true;
        return {
          ...prev,
          offers: prev.offers.map((item) =>
            item.id === offerId ? { ...item, status: 'accepted' } : item,
          ),
          escrowDeals: [persistedDeal, ...prev.escrowDeals],
          deposits: funded?.deposits ?? prev.deposits,
          listings: prev.listings.map((item) =>
            item.id === listing.id ? { ...item, escrowId: persistedDeal.id } : item,
          ),
        };
      });

      return accepted;
    },
    [data],
  );

  const resolveEscrow = useCallback(
    async (escrowId: string, action: 'completeSale' | 'mutualClose'): Promise<boolean> => {
      const deal = data.escrowDeals.find((item) => item.id === escrowId);
      if (!deal || deal.parties.sellerPubkey !== DEMO_SELLER_PUBKEY) return false;

      if (action === 'completeSale' && deal.status !== 'awaiting_title_clearance') return false;
      if (action === 'mutualClose' && deal.status !== 'funded') return false;

      // Broadcast the resolution transaction against the contract.
      const resolvedDeal =
        action === 'completeSale'
          ? await completeSale(data, deal)
          : await mutualClose(data, deal);
      if (!resolvedDeal) return false;

      let resolved = false;
      setData((current) => {
        const currentDeal = current.escrowDeals.find((item) => item.id === escrowId);
        if (!currentDeal) return current;
        resolved = true;
        return applyEscrowCompletion(current, resolvedDeal);
      });

      return resolved;
    },
    [data],
  );

  const resetData = useCallback(() => {
    setData(resetAppData());
  }, []);

  const value = useMemo<AppDataContextValue>(
    () => ({
      data,
      addOffer,
      addDeposit,
      startEscrowFromBuy,
      getSellerProperties,
      getSellerListings,
      getSellerOffers,
      getSellerEscrows,
      createListing,
      updateListingPrice,
      delistProperty,
      respondToOffer,
      resolveEscrow,
      resetData,
      getPropertyById: (id: string) => getPropertyById(data, id),
    }),
    [
      data,
      addOffer,
      addDeposit,
      startEscrowFromBuy,
      getSellerProperties,
      getSellerListings,
      getSellerOffers,
      getSellerEscrows,
      createListing,
      updateListingPrice,
      delistProperty,
      respondToOffer,
      resolveEscrow,
      resetData,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
}
