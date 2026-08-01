/**
 * Simple Property NFT Demo — demonstrates NFT metadata structure
 *
 * This is a simplified demo that shows the property NFT metadata structure
 * and how it would be serialized for the blockchain.
 */

// Property NFT metadata structure (matches the main interface)
interface PropertyNFTMetadata {
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

// Demo property metadata
const demoPropertyMetadata: PropertyNFTMetadata = {
  propertyId: 'prop-demo-001',
  propertyType: 'residential',
  subtype: 'single_family',
  address: '123 Blockchain Street, Crypto City, BCH 12345',
  gpsCoordinates: {
    lat: 37.7749,
    lng: -122.4194,
  },
  lotArea: '2,400 sq ft',
  floorArea: '2,400 sq ft',
  bedrooms: 3,
  bathrooms: 2,
  garage: 1,
  yearBuilt: 2020,
  priceBCH: 5.5,
  sellerWallet: 'bchtest:qpuuwnw6msvvc2u4gm56vzpq5lwrmv8luy2ez6zj80',
  currentOwnerWallet: 'bchtest:qpuuwnw6msvvc2u4gm56vzpq5lwrmv8luy2ez6zj80',
  governmentTitleNumber: 'BCH-TITLE-2024-DEMO-001',
  images: ['ipfs://QmExample1', 'ipfs://QmExample2'],
  blueprint: 'ipfs://QmBlueprintExample',
  inspectionReport: 'ipfs://QmInspectionExample',
  status: 'For Sale',
};

/**
 * Serialize property metadata to NFT commitment (max 128 bytes)
 * For production, this should use a more sophisticated encoding or IPFS hash
 */
function serializeMetadata(metadata: PropertyNFTMetadata): string {
  // Create a compact JSON representation
  const compact = {
    i: metadata.propertyId,
    p: metadata.priceBCH,
    s: metadata.status.charAt(0), // F, S, R
  };
  
  // For production, store IPFS hash of full metadata instead
  const jsonString = JSON.stringify(compact);
  
  // Ensure it fits in 128 bytes (for commitment)
  if (jsonString.length > 128) {
    throw new Error('Metadata too large for NFT commitment. Use IPFS hash instead.');
  }
  
  return jsonString;
}

/**
 * Parse NFT commitment back to metadata
 */
function parseNFTCommitment(commitment: string): Partial<PropertyNFTMetadata> {
  try {
    const parsed = JSON.parse(commitment);
    
    // Map compact format back to full structure
    return {
      propertyId: parsed.i,
      priceBCH: parsed.p,
      status: parsed.s === 'F' ? 'For Sale' : 
              parsed.s === 'S' ? 'Sold' : 'Reserved',
    };
  } catch (error) {
    console.error('Error parsing NFT commitment:', error);
    return {};
  }
}

function main() {
  console.log('\n=== Property NFT Metadata Demo ===\n');

  console.log('1. Full Property Metadata:');
  console.log(JSON.stringify(demoPropertyMetadata, null, 2));

  console.log('\n2. Serialized NFT Commitment (max 128 bytes):');
  const commitment = serializeMetadata(demoPropertyMetadata);
  console.log(`   Commitment: ${commitment}`);
  console.log(`   Length: ${commitment.length} bytes`);

  console.log('\n3. Parsed Metadata from Commitment:');
  const parsedMetadata = parseNFTCommitment(commitment);
  console.log(JSON.stringify(parsedMetadata, null, 2));

  console.log('\n4. Production Recommendation:');
  console.log('   For production, store full metadata on IPFS and include');
  console.log('   the IPFS hash in the NFT commitment instead of compact JSON.');
  console.log('   Example commitment format:');
  console.log('   { "ipfs": "QmXxx...", "id": "prop-001", "status": "F" }');

  console.log('\n5. CashScript Contract Features:');
  console.log('   ✓ mintProperty - Create new property NFT with metadata');
  console.log('   ✓ transferProperty - Transfer NFT to new owner');
  console.log('   ✓ escrowTransfer - Transfer NFT through escrow contract');
  console.log('   ✓ Immutable NFTs - Metadata cannot be changed after minting');
  console.log('   ✓ On-chain verification - All transfers visible on blockchain');

  console.log('\n6. Integration with mainnet-js:');
  console.log('   Use mainnet-js to:');
  console.log('   - Create wallets and manage keys');
  console.log('   - Mint NFTs with tokenGenesis()');
  console.log('   - Transfer NFTs with send()');
  console.log('   - Query NFT ownership and metadata');
  console.log('   - Handle BCH payments for property purchases');

  console.log('\n=== Demo Complete ===\n');
}

main();