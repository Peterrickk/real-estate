import type { Property } from '../modules/property-registry/types';
import type { Listing } from '../modules/marketplace/types';
import type { TransferRecord } from '../modules/ownership-history/types';
import type { PriceHistoryPoint, ValuationSummary } from '../modules/land-insights/types';

export const mockProperties: Property[] = [
  {
    id: 'prop-001',
    address: '142 Palm Grove Ave, Miami, FL',
    size: '2,400 sq ft',
    legalId: 'MIA-2024-00891',
    tokenId: 'BCH-RE-001',
    ownerPubkey: '02a1b2c3d4e5f6789012345678901234567890abcd',
    listedPrice: null,
    dateTokenized: '2024-03-15',
    tokenized: true,
    lat: 25.7781,
    lng: -80.2197,
    hazard: {
      floodZone: 'Coastal / AE',
      terrainClass: 'lowland',
      seismicBaseline: 'low',
      elevationM: 2,
      developmentSignals: [
        {
          label: 'Waterfront mixed-use redevelopment',
          distanceKm: 0.8,
          signal: 'positive',
          note: 'Under construction two blocks away',
        },
        {
          label: 'Metrorail station expansion',
          distanceKm: 1.5,
          signal: 'positive',
          note: 'Transit upgrades approved',
        },
      ],
    },
  },
  {
    id: 'prop-002',
    address: '88 Harbor View Dr, Austin, TX',
    size: '1,850 sq ft',
    legalId: 'AUS-2023-01442',
    tokenId: 'BCH-RE-002',
    ownerPubkey: '03fedcba0987654321098765432109876543210ef',
    listedPrice: 620_000,
    dateTokenized: '2023-11-02',
    tokenized: true,
    lat: 30.2672,
    lng: -97.7431,
    hazard: {
      floodZone: 'X (minimal)',
      terrainClass: 'upland',
      seismicBaseline: 'low',
      elevationM: 149,
      developmentSignals: [
        {
          label: 'Tech office campus under construction',
          distanceKm: 1.2,
          signal: 'positive',
          note: 'Two towers breaking ground',
        },
      ],
    },
  },
  {
    id: 'prop-003',
    address: '501 Desert Ridge Ln, Phoenix, AZ',
    size: '3,100 sq ft',
    legalId: 'PHX-2024-00217',
    tokenId: 'BCH-RE-003',
    ownerPubkey: '02abc123def456789012345678901234567890ab',
    listedPrice: null,
    dateTokenized: '2024-06-20',
    tokenized: true,
    lat: 33.5722,
    lng: -112.0892,
    hazard: {
      floodZone: 'X (minimal)',
      terrainClass: 'upland',
      seismicBaseline: 'low',
      elevationM: 331,
    },
  },
  {
    id: 'prop-004',
    address: '19 Lakefront Blvd, Denver, CO',
    size: '2,750 sq ft',
    legalId: 'DEN-2022-03105',
    tokenId: '',
    ownerPubkey: '03def456abc789012345678901234567890cdef12',
    listedPrice: null,
    dateTokenized: '',
    tokenized: false,
    lat: 39.7392,
    lng: -104.9903,
    hazard: {
      floodZone: 'X (minimal)',
      terrainClass: 'steep',
      seismicBaseline: 'moderate',
      elevationM: 1609,
    },
  },
];

export const mockListings: Listing[] = mockProperties
  .filter((p) => p.listedPrice !== null)
  .map((p) => ({
    id: `listing-${p.id}`,
    propertyId: p.id,
    address: p.address,
    size: p.size,
    askingPrice: p.listedPrice!,
    sellerPubkey: p.ownerPubkey,
    listedAt: p.id === 'prop-001' ? '2025-01-10' : '2024-12-05',
  }));

export const mockTransferHistory: Record<string, TransferRecord[]> = {
  'prop-001': [
    {
      id: 'tx-001-a',
      propertyId: 'prop-001',
      owner: '02a1b2c3d4e5f6789012345678901234567890abcd',
      dateAcquired: '2024-03-15',
      dateSold: '2025-01-10',
      priceAtTime: 485_000,
    },
    {
      id: 'tx-001-b',
      propertyId: 'prop-001',
      owner: '03prev001owner00000000000000000000000001',
      dateAcquired: '2021-06-01',
      dateSold: '2024-03-15',
      priceAtTime: 410_000,
    },
    {
      id: 'tx-001-c',
      propertyId: 'prop-001',
      owner: '03orig001owner00000000000000000000000001',
      dateAcquired: '2018-09-12',
      dateSold: '2021-06-01',
      priceAtTime: 355_000,
    },
  ],
  'prop-002': [
    {
      id: 'tx-002-a',
      propertyId: 'prop-002',
      owner: '03fedcba0987654321098765432109876543210ef',
      dateAcquired: '2023-11-02',
      dateSold: null,
      priceAtTime: 620_000,
    },
    {
      id: 'tx-002-b',
      propertyId: 'prop-002',
      owner: '03prev002owner00000000000000000000000002',
      dateAcquired: '2019-04-18',
      dateSold: '2023-11-02',
      priceAtTime: 495_000,
    },
  ],
  'prop-003': [
    {
      id: 'tx-003-a',
      propertyId: 'prop-003',
      owner: '02abc123def456789012345678901234567890ab',
      dateAcquired: '2024-06-20',
      dateSold: null,
      priceAtTime: 540_000,
    },
  ],
};

export const mockPriceHistory: Record<string, PriceHistoryPoint[]> = {
  'prop-001': [
    { date: '2018-09-12', price: 355_000 },
    { date: '2021-06-01', price: 410_000 },
    { date: '2024-03-15', price: 450_000 },
    { date: '2025-01-10', price: 485_000 },
  ],
  'prop-002': [
    { date: '2019-04-18', price: 495_000 },
    { date: '2023-11-02', price: 580_000 },
    { date: '2024-12-05', price: 620_000 },
  ],
  'prop-003': [
    { date: '2020-02-01', price: 420_000 },
    { date: '2022-08-15', price: 480_000 },
    { date: '2024-06-20', price: 540_000 },
  ],
};

export const mockValuationSummaries: Record<string, ValuationSummary> = {
  'prop-001': {
    propertyId: 'prop-001',
    currentEstimatedValue: 502_000,
    priceChangeSinceLastSale: 17_000,
    priceChangePercent: 3.5,
    comparableLandAverage: 488_000,
    lastSalePrice: 485_000,
    lastSaleDate: '2025-01-10',
  },
  'prop-002': {
    propertyId: 'prop-002',
    currentEstimatedValue: 635_000,
    priceChangeSinceLastSale: 15_000,
    priceChangePercent: 2.4,
    comparableLandAverage: 610_000,
    lastSalePrice: 620_000,
    lastSaleDate: '2024-12-05',
  },
  'prop-003': {
    propertyId: 'prop-003',
    currentEstimatedValue: 555_000,
    priceChangeSinceLastSale: 15_000,
    priceChangePercent: 2.8,
    comparableLandAverage: 530_000,
    lastSalePrice: 540_000,
    lastSaleDate: '2024-06-20',
  },
};
