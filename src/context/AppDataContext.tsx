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
  DEMO_BUYER_PUBKEY,
  getPropertyById,
  loadAppData,
  resetAppData,
  saveAppData,
  type AppData,
} from '../data/storage';
import type { Offer } from '../modules/marketplace/types';

interface SubmitOfferInput {
  listingId: string;
  propertyId: string;
  offerAmount: number;
  message: string;
}

interface AppDataContextValue {
  data: AppData;
  addOffer: (input: SubmitOfferInput) => Offer;
  purchaseListing: (listingId: string) => boolean;
  resetData: () => void;
  getPropertyById: (id: string) => ReturnType<typeof getPropertyById>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

function createOfferId(): string {
  return `offer-${Date.now()}`;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadAppData());

  useEffect(() => {
    saveAppData(data);
  }, [data]);

  const addOffer = useCallback((input: SubmitOfferInput): Offer => {
    const offer: Offer = {
      id: createOfferId(),
      listingId: input.listingId,
      propertyId: input.propertyId,
      offerAmount: input.offerAmount,
      buyerPubkey: DEMO_BUYER_PUBKEY,
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

  const purchaseListing = useCallback((listingId: string): boolean => {
    let purchased = false;

    setData((current) => {
      const listing = current.listings.find((item) => item.id === listingId);
      if (!listing) return current;

      const property = current.properties.find((item) => item.id === listing.propertyId);
      if (!property) return current;

      purchased = true;
      const purchaseDate = todayIsoDate();
      const previousOwner = property.ownerPubkey;
      const history = current.transferHistory[property.id] ?? [];

      const updatedHistory = history.map((record) =>
        record.owner === previousOwner && record.dateSold === null
          ? { ...record, dateSold: purchaseDate }
          : record,
      );

      updatedHistory.unshift({
        id: `tx-${property.id}-${Date.now()}`,
        propertyId: property.id,
        owner: DEMO_BUYER_PUBKEY,
        dateAcquired: purchaseDate,
        dateSold: null,
        priceAtTime: listing.askingPrice,
      });

      const updatedPriceHistory = [
        { date: purchaseDate, price: listing.askingPrice },
        ...(current.priceHistory[property.id] ?? []),
      ];

      return {
        ...current,
        properties: current.properties.map((item) =>
          item.id === property.id
            ? {
                ...item,
                ownerPubkey: DEMO_BUYER_PUBKEY,
                listedPrice: null,
              }
            : item,
        ),
        listings: current.listings.filter((item) => item.id !== listingId),
        transferHistory: {
          ...current.transferHistory,
          [property.id]: updatedHistory,
        },
        priceHistory: {
          ...current.priceHistory,
          [property.id]: updatedPriceHistory,
        },
      };
    });

    return purchased;
  }, []);

  const resetData = useCallback(() => {
    setData(resetAppData());
  }, []);

  const value = useMemo<AppDataContextValue>(
    () => ({
      data,
      addOffer,
      purchaseListing,
      resetData,
      getPropertyById: (id: string) => getPropertyById(data, id),
    }),
    [data, addOffer, purchaseListing, resetData],
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
