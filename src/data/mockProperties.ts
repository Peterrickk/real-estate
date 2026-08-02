import type { Property } from '../modules/property-registry/types';
import type { Listing } from '../modules/marketplace/types';
import type { TransferRecord } from '../modules/ownership-history/types';
import type { PriceHistoryPoint, ValuationSummary } from '../modules/land-insights/types';

// Helper function to generate random BCH wallet addresses
function generateWalletAddress(): string {
  const chars = '0123456789abcdef';
  let result = '03';
  for (let i = 0; i < 62; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// Helper function to generate random NFT Token ID
function generateTokenId(): string {
  return `BCH-LAND-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
}

// Helper function to generate random certificate number
function generateCertificateNumber(): string {
  return `CERT-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
}

// Philippine locations
const philippineLocations = [
  { city: 'Makati', province: 'Metro Manila', lat: 14.5547, lng: 121.0244 },
  { city: 'Taguig', province: 'Metro Manila', lat: 14.4793, lng: 121.0766 },
  { city: 'Quezon City', province: 'Metro Manila', lat: 14.6760, lng: 121.0437 },
  { city: 'Pasig', province: 'Metro Manila', lat: 14.5764, lng: 121.0851 },
  { city: 'Cebu City', province: 'Cebu', lat: 10.3157, lng: 123.8854 },
  { city: 'Davao', province: 'Davao del Sur', lat: 7.0731, lng: 125.6128 },
  { city: 'Baguio', province: 'Benguet', lat: 16.4023, lng: 120.5960 },
  { city: 'Bacolod', province: 'Negros Occidental', lat: 10.6718, lng: 122.9510 },
  { city: 'Iloilo', province: 'Iloilo', lat: 10.7202, lng: 122.5621 },
  { city: 'Cagayan de Oro', province: 'Misamis Oriental', lat: 8.4542, lng: 124.6319 },
  { city: 'Palawan', province: 'Palawan', lat: 9.8403, lng: 118.7352 },
  { city: 'Batangas', province: 'Batangas', lat: 13.7565, lng: 121.0584 },
  { city: 'Laguna', province: 'Laguna', lat: 14.2794, lng: 121.4095 },
  { city: 'Bulacan', province: 'Bulacan', lat: 14.7935, lng: 120.8657 },
  { city: 'Pampanga', province: 'Pampanga', lat: 15.0745, lng: 120.6046 },
  { city: 'Cavite', province: 'Cavite', lat: 14.2940, lng: 120.9030 },
];

// Property types
const propertyTypes = [
  'Modern House',
  'Beach House',
  'Townhouse',
  'Condominium',
  'Apartment',
  'Vacant Lot',
  'Commercial Building',
  'Office Space',
  'Warehouse',
  'Agricultural Land',
  'Farm',
  'Resort',
  'Hotel',
  'Beach Lot',
  'Mountain Lot',
  'Industrial Lot',
  'Mixed Use Property',
];

// Street names for realistic addresses
const streetNames = [
  'Rizal Avenue', 'Mabini Street', 'Bonifacio Drive', 'Luna Street', ' Aguinaldo Highway',
  'Maharlika Highway', 'Quezon Boulevard', 'San Juan Street', 'Santiago Street', 'Magellan Street',
  'Legaspi Street', 'Mendiola Street', 'España Boulevard', 'Taft Avenue', 'Shaw Boulevard',
  'Ortigas Avenue', 'EDSA', 'Commonwealth Avenue', 'Ayala Avenue', 'Paseo de Roxas',
];

// Generate 50 Philippine properties
const generatePhilippineProperties = (): Property[] => {
  const properties: Property[] = [];
  
  for (let i = 1; i <= 50; i++) {
    const location = philippineLocations[Math.floor(Math.random() * philippineLocations.length)];
    const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
    const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
    const lotSize = Math.floor(Math.random() * 2000) + 150; // 150-2150 sqm
    const floorArea = propertyType.includes('Lot') || propertyType.includes('Land') || propertyType.includes('Farm') ? 0 : Math.floor(Math.random() * 500) + 50; // 50-550 sqm
    const bedrooms = floorArea > 0 ? Math.floor(Math.random() * 5) + 1 : 0;
    const bathrooms = floorArea > 0 ? Math.floor(Math.random() * 4) + 1 : 0;
    const price = Math.floor(Math.random() * 4) + 1; // ₱1-₱5
    
    const property: Property = {
      id: `prop-${i.toString().padStart(3, '0')}`,
      address: `${Math.floor(Math.random() * 999) + 1} ${streetName}, ${location.city}, ${location.province}`,
      size: `${lotSize.toLocaleString()} sqm`,
      legalId: `LRC-${location.province.substring(0, 3).toUpperCase()}-${2024}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      tokenId: generateTokenId(),
      ownerPubkey: generateWalletAddress(),
      listedPrice: price,
      dateTokenized: '2024-01-15',
      tokenized: true,
      lat: location.lat + (Math.random() - 0.5) * 0.01,
      lng: location.lng + (Math.random() - 0.5) * 0.01,
      hazard: {
        floodZone: Math.random() > 0.7 ? 'X (minimal)' : 'AE',
        terrainClass: Math.random() > 0.5 ? 'upland' : 'lowland',
        seismicBaseline: 'low',
        elevationM: Math.floor(Math.random() * 100) + 10,
        developmentSignals: Math.random() > 0.5 ? [
          {
            label: 'Commercial development nearby',
            distanceKm: Math.random() * 2 + 0.5,
            signal: 'positive',
            note: 'New infrastructure planned',
          },
        ] : [],
      },
      propertyType,
      floorArea: floorArea > 0 ? `${floorArea} sqm` : undefined,
      bedrooms: bedrooms > 0 ? bedrooms : undefined,
      bathrooms: bathrooms > 0 ? bathrooms : undefined,
      certificateNumber: generateCertificateNumber(),
      nftTokenId: generateTokenId(),
      cashTokenCategory: `CAT-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      blockchain: 'BCH',
      verificationStatus: 'verified',
      previousOwner: generateWalletAddress(),
      mintDate: '2024-01-15',
    };
    
    properties.push(property);
  }
  
  return properties;
};

export const mockProperties: Property[] = generatePhilippineProperties();

export const mockListings: Listing[] = mockProperties
  .filter((p) => p.listedPrice !== null)
  .map((p) => ({
    id: `listing-${p.id}`,
    propertyId: p.id,
    address: p.address,
    size: p.size,
    askingPrice: p.listedPrice!,
    sellerPubkey: p.ownerPubkey,
    listedAt: '2024-12-05',
  }));

export const mockTransferHistory: Record<string, TransferRecord[]> = {
  'prop-001': [
    {
      id: 'tx-001-a',
      propertyId: 'prop-001',
      owner: mockProperties[0].ownerPubkey,
      dateAcquired: '2024-03-15',
      dateSold: null,
      priceAtTime: 3,
    },
    {
      id: 'tx-001-b',
      propertyId: 'prop-001',
      owner: generateWalletAddress(),
      dateAcquired: '2021-06-01',
      dateSold: '2024-03-15',
      priceAtTime: 2,
    },
  ],
  'prop-002': [
    {
      id: 'tx-002-a',
      propertyId: 'prop-002',
      owner: mockProperties[1].ownerPubkey,
      dateAcquired: '2023-11-02',
      dateSold: null,
      priceAtTime: 4,
    },
    {
      id: 'tx-002-b',
      propertyId: 'prop-002',
      owner: generateWalletAddress(),
      dateAcquired: '2019-04-18',
      dateSold: '2023-11-02',
      priceAtTime: 3,
    },
  ],
  'prop-003': [
    {
      id: 'tx-003-a',
      propertyId: 'prop-003',
      owner: mockProperties[2].ownerPubkey,
      dateAcquired: '2024-06-20',
      dateSold: null,
      priceAtTime: 5,
    },
  ],
};

export const mockPriceHistory: Record<string, PriceHistoryPoint[]> = {
  'prop-001': [
    { date: '2021-06-01', price: 2 },
    { date: '2024-03-15', price: 3 },
  ],
  'prop-002': [
    { date: '2019-04-18', price: 3 },
    { date: '2023-11-02', price: 4 },
  ],
  'prop-003': [
    { date: '2024-06-20', price: 5 },
  ],
};

export const mockValuationSummaries: Record<string, ValuationSummary> = {
  'prop-001': {
    propertyId: 'prop-001',
    currentEstimatedValue: 3,
    priceChangeSinceLastSale: 0,
    priceChangePercent: 0,
    comparableLandAverage: 3,
    lastSalePrice: 3,
    lastSaleDate: '2024-03-15',
  },
  'prop-002': {
    propertyId: 'prop-002',
    currentEstimatedValue: 4,
    priceChangeSinceLastSale: 0,
    priceChangePercent: 0,
    comparableLandAverage: 4,
    lastSalePrice: 4,
    lastSaleDate: '2023-11-02',
  },
  'prop-003': {
    propertyId: 'prop-003',
    currentEstimatedValue: 5,
    priceChangeSinceLastSale: 0,
    priceChangePercent: 0,
    comparableLandAverage: 5,
    lastSalePrice: 5,
    lastSaleDate: '2024-06-20',
  },
};
