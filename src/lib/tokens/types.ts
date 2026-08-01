/**
 * Token Service Types
 * 
 * Type definitions for property NFT management
 */

// Property NFT metadata structure
export interface PropertyNFTMetadata {
  propertyId: string;
  propertyType: string;
  subtype: string;
  address: string;
  gpsCoordinates: {
    lat: number;
    lng: number;
  };
  lotArea: string;
  floorArea: string;
  bedrooms: number;
  bathrooms: number;
  garage: number;
  yearBuilt: number;
  priceBCH: number;
  sellerWallet: string;
  currentOwnerWallet: string;
  governmentTitleNumber: string;
  images: string[]; // IPFS URIs
  blueprint: string; // IPFS URI
  inspectionReport: string; // IPFS URI
  status: 'For Sale' | 'Sold' | 'Reserved';
}