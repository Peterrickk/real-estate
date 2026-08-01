/**
 * Token Service for Property NFT Management
 * 
 * This service handles the creation, transfer, and management of property NFTs
 * using mainnet-js and CashScript contracts.
 */

import { Wallet, TestNetWallet, NFTCapability } from 'mainnet-js';
import type { PropertyNFTMetadata } from './types';

// Re-export types for convenience
export type { PropertyNFTMetadata };

// Token service configuration
export interface TokenServiceConfig {
  network?: 'mainnet' | 'testnet';
  contractArtifactPath?: string;
}

export class PropertyTokenService {
  private wallet: Wallet | TestNetWallet | null = null;
  private network: 'mainnet' | 'testnet';

  constructor(config: TokenServiceConfig = {}) {
    this.network = config.network || 'testnet';
  }

  /**
   * Initialize wallet with existing mnemonic or create new one
   */
  async initializeWallet(mnemonic?: string): Promise<void> {
    if (this.network === 'mainnet') {
      this.wallet = mnemonic 
        ? await Wallet.fromSeed(mnemonic)
        : await Wallet.newRandom();
    } else {
      this.wallet = mnemonic
        ? await TestNetWallet.fromSeed(mnemonic)
        : await TestNetWallet.newRandom();
    }
  }

  /**
   * Get wallet address
   */
  getWalletAddress(): string {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }
    // For HD wallets, this would get the first address
    // Placeholder for now - actual implementation depends on mainnet-js version
    return 'demo-wallet-address';
  }

  /**
   * Get wallet balance in BCH
   */
  async getBalance(): Promise<bigint> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }
    const balance = await this.wallet.getBalance();
    return balance;
  }

  /**
   * Serialize property metadata to NFT commitment (max 128 bytes)
   * For production, this should use a more sophisticated encoding or IPFS hash
   */
  static serializeMetadata(metadata: PropertyNFTMetadata): string {
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
   * Mint a new property NFT
   */
  async mintPropertyNFT(
    metadata: PropertyNFTMetadata
  ): Promise<{ tokenId: string; txid: string }> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized. Call initializeWallet() first.');
    }

    try {
      // Serialize metadata for NFT commitment
      const commitment = PropertyTokenService.serializeMetadata(metadata);

      // Create NFT with mainnet-js
      const tokenGenesis = await this.wallet.tokenGenesis({
        amount: 0n, // No fungible tokens, just NFT
        nft: {
          capability: NFTCapability.minting,
          commitment: commitment,
        },
      });

      console.log('NFT minted successfully:', tokenGenesis);
      
      return {
        tokenId: 'unknown', // Will be available in the actual response
        txid: tokenGenesis.txId || 'unknown',
      };
    } catch (error) {
      console.error('Error minting property NFT:', error);
      throw error;
    }
  }

  /**
   * Transfer property NFT to new owner
   */
  async transferPropertyNFT(
    tokenId: string,
    newOwnerAddress: string
  ): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized. Call initializeWallet() first.');
    }

    try {
      // Get UTXOs containing the NFT
      const utxos = await this.wallet.getUtxos();
      const nftUtxo = utxos.find(utxo => 
        utxo.token?.category === tokenId && utxo.token?.nft
      );

      if (!nftUtxo) {
        throw new Error('NFT not found in wallet');
      }

      // Note: Actual send implementation depends on mainnet-js API version
      // This is a placeholder for the actual implementation
      console.log('Transferring NFT to:', newOwnerAddress);
      console.log('NFT commitment:', nftUtxo.token!.nft!.commitment);
      
      return 'demo-txid';
    } catch (error) {
      console.error('Error transferring property NFT:', error);
      throw error;
    }
  }

  /**
   * Get NFTs owned by wallet
   */
  async getOwnedNFTs(): Promise<any[]> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized. Call initializeWallet() first.');
    }

    try {
      const utxos = await this.wallet.getUtxos();
      const nftUtxos = utxos.filter(utxo => utxo.token?.nft);
      
      return nftUtxos.map(utxo => ({
        tokenId: utxo.token?.category,
        commitment: utxo.token?.nft?.commitment,
        capability: utxo.token?.nft?.capability,
        satoshis: utxo.satoshis,
      }));
    } catch (error) {
      console.error('Error getting owned NFTs:', error);
      throw error;
    }
  }

  /**
   * Update property NFT status (requires mutable NFT)
   */
  async updatePropertyStatus(
    tokenId: string,
    newStatus: 'For Sale' | 'Sold' | 'Reserved'
  ): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized. Call initializeWallet() first.');
    }

    try {
      // Get current NFT UTXO
      const utxos = await this.wallet.getUtxos();
      const nftUtxo = utxos.find(utxo => 
        utxo.token?.category === tokenId && utxo.token?.nft
      );

      if (!nftUtxo) {
        throw new Error('NFT not found in wallet');
      }

      // Parse current commitment
      const currentMetadata = JSON.parse(nftUtxo.token!.nft!.commitment || '{}');
      currentMetadata.s = newStatus.charAt(0);

      // Update commitment
      const newCommitment = JSON.stringify(currentMetadata);

      // Note: Actual send implementation depends on mainnet-js API version
      console.log('Updating NFT status to:', newStatus);
      console.log('New commitment:', newCommitment);
      
      return 'demo-txid';
    } catch (error) {
      console.error('Error updating property status:', error);
      throw error;
    }
  }

  /**
   * Get property metadata from NFT commitment
   */
  static parseNFTCommitment(commitment: string): Partial<PropertyNFTMetadata> {
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
}

// Export singleton instance
export const tokenService = new PropertyTokenService();