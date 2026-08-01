/**
 * PropertyNFT Demo — demonstrates property NFT creation and transfer
 *
 * This demo shows how to:
 * 1. Create a property NFT with metadata
 * 2. Transfer the NFT to a new owner
 * 3. Parse NFT commitment to retrieve metadata
 *
 * Run with: npm run demo:PropertyNFT (add to package.json scripts first)
 */

import { PropertyTokenService, PropertyNFTMetadata } from '../src/lib/tokens/tokenService';

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

async function main() {
  console.log('\n=== Property NFT Demo ===\n');

  // Initialize token service
  const tokenService = new PropertyTokenService({ network: 'testnet' });

  console.log('1. Initializing wallet...');
  try {
    await tokenService.initializeWallet();
    console.log(`   Wallet address: ${tokenService.getWalletAddress()}`);
    
    const balance = await tokenService.getBalance();
    console.log(`   Wallet balance: ${balance} satoshis`);
  } catch (error) {
    console.error('   Error initializing wallet:', error);
    console.log('   Note: This requires a real wallet. In production, integrate with your wallet provider.');
    return;
  }

  console.log('\n2. Creating property NFT...');
  try {
    const result = await tokenService.mintPropertyNFT(
      demoPropertyMetadata,
      demoPropertyMetadata.currentOwnerWallet
    );
    console.log(`   ✓ NFT minted successfully!`);
    console.log(`   Token ID: ${result.tokenId}`);
    console.log(`   Transaction ID: ${result.txid}`);
  } catch (error) {
    console.error('   Error minting NFT:', error);
    console.log('   Note: This requires actual BCH. On testnet, use a faucet to get test BCH.');
  }

  console.log('\n3. Parsing NFT commitment...');
  // Simulate the commitment that would be stored in the NFT
  const commitment = PropertyTokenService.serializeMetadata(demoPropertyMetadata);
  console.log(`   Commitment: ${commitment}`);
  
  const parsedMetadata = PropertyTokenService.parseNFTCommitment(commitment);
  console.log(`   ✓ Parsed metadata:`, parsedMetadata);

  console.log('\n4. Getting owned NFTs...');
  try {
    const ownedNFTs = await tokenService.getOwnedNFTs();
    console.log(`   Found ${ownedNFTs.length} NFT(s):`);
    ownedNFTs.forEach((nft, index) => {
      console.log(`   ${index + 1}. Token ID: ${nft.tokenId}`);
      console.log(`      Commitment: ${nft.commitment}`);
      console.log(`      Capability: ${nft.capability}`);
    });
  } catch (error) {
    console.error('   Error getting owned NFTs:', error);
  }

  console.log('\n5. Transferring NFT to new owner...');
  const newOwnerAddress = 'bchtest:qqfn49vddrmlf0ldr4qs230r8rd5em729qzpheq85u';
  try {
    // This would use the tokenId from step 2 in a real scenario
    const demoTokenId = 'demo-token-id';
    const txid = await tokenService.transferPropertyNFT(
      demoTokenId,
      'demo-private-key', // Would be real private key in production
      newOwnerAddress
    );
    console.log(`   ✓ NFT transferred successfully!`);
    console.log(`   Transaction ID: ${txid}`);
  } catch (error) {
    console.error('   Error transferring NFT:', error);
    console.log('   Note: This requires actual NFT ownership and private key.');
  }

  console.log('\n6. Updating property status...');
  try {
    const demoTokenId = 'demo-token-id';
    const txid = await tokenService.updatePropertyStatus(demoTokenId, 'Sold');
    console.log(`   ✓ Property status updated successfully!`);
    console.log(`   Transaction ID: ${txid}`);
  } catch (error) {
    console.error('   Error updating property status:', error);
    console.log('   Note: This requires a mutable NFT and actual ownership.');
  }

  console.log('\n=== Demo Complete ===');
  console.log('\nKey Points:');
  console.log('- Property NFTs are created with comprehensive metadata');
  console.log('- Metadata is stored in the NFT commitment (up to 128 bytes)');
  console.log('- For production, store full metadata on IPFS and put hash in commitment');
  console.log('- NFTs can be transferred between owners on the blockchain');
  console.log('- Mutable NFTs allow status updates without new transactions');
  console.log('- All operations are recorded on the Bitcoin Cash blockchain');
}

main().catch((error) => {
  console.error('Demo failed:', error);
  process.exit(1);
});