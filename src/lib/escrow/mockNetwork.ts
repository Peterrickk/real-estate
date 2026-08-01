import { Contract, MockNetworkProvider, type Artifact } from 'cashscript';
import artifact from '../../../artifacts/PropertySaleEscrow.json';
import type { FiatDeposit } from '../../modules/funding/types';
import { findDemoWalletByPublicKey, getDemoWalletForEmail } from '../ownerKeys';
import { ESCROW_SIGNATURE_REQUIREMENTS, type EscrowDeal, type EscrowParties } from './types';

const escrowArtifact = artifact as Artifact;

/**
 * The shared in-memory network for the app's escrow flow.
 *
 * Every escrow operation re-derives the UTXO set from persisted app data
 * (`seedMockNetwork`) and then broadcasts real `PropertySaleEscrow` contract
 * transactions against this provider. No external server is contacted and no
 * real BCH moves — signatures are still verified by the CashScript VM.
 */
export const mockNetwork = new MockNetworkProvider({ updateUtxoSet: true });

/** Deterministic pseudo-txid (64 hex) derived from a seed string. */
export function mockTxid(seed: string): string {
  const bytes = new TextEncoder().encode(seed);
  const out = new Uint8Array(32);
  let hash = 0x811c9dc5;
  for (let round = 0; round < 4; round += 1) {
    for (const byte of bytes) {
      hash ^= byte;
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    const offset = round * 4;
    out[offset] = (hash >>> 24) & 0xff;
    out[offset + 1] = (hash >>> 16) & 0xff;
    out[offset + 2] = (hash >>> 8) & 0xff;
    out[offset + 3] = hash & 0xff;
    hash = (hash ^ 0x9e3779b9) >>> 0;
  }
  return Array.from(out, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Instantiate a PropertySaleEscrow contract for the deal's parties. */
export function getEscrowContract(parties: Pick<EscrowParties, 'buyerPubkey' | 'sellerPubkey' | 'arbiterPubkey'>) {
  return new Contract(
    escrowArtifact,
    [parties.buyerPubkey, parties.sellerPubkey, parties.arbiterPubkey],
    { provider: mockNetwork },
  );
}

/** The contract's P2SH32 address for a set of parties. */
export function getContractAddressForParties(
  parties: Pick<EscrowParties, 'buyerPubkey' | 'sellerPubkey' | 'arbiterPubkey'>,
): string {
  return getEscrowContract(parties).address;
}

function depositTxid(deposit: FiatDeposit): string {
  return mockTxid(`dep:${deposit.id}`);
}

/**
 * Rebuild the mock UTXO set as a projection of the persisted app data so it
 * survives page reloads and never double-counts funds:
 *  - completed deposits → UTXOs at the deposit email's wallet (remainingSats)
 *  - funded / awaiting-title deals → a UTXO at the escrow contract
 *  - resolved deals → the payout UTXO at the receiving party's wallet
 */
export function seedMockNetwork(deposits: FiatDeposit[], deals: EscrowDeal[]): void {
  mockNetwork.reset();

  const completedDeposits = deposits
    .filter((deposit) => deposit.status === 'completed' && deposit.remainingSats > 0)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  for (const deposit of completedDeposits) {
    const wallet = getDemoWalletForEmail(deposit.email);
    if (!wallet) continue;
    mockNetwork.addUtxo(wallet.address, {
      txid: depositTxid(deposit),
      vout: 0,
      satoshis: BigInt(deposit.remainingSats),
    });
  }

  for (const deal of deals) {
    if (!deal.contractAddress) continue;

    if (deal.status === 'funded' || deal.status === 'awaiting_title_clearance') {
      if (deal.fundedSats == null || deal.fundedSats <= 0) continue;
      mockNetwork.addUtxo(deal.contractAddress, {
        txid: mockTxid(`escrow:${deal.id}`),
        vout: 0,
        satoshis: BigInt(deal.fundedSats),
      });
      continue;
    }

    if (
      deal.status === 'completed' ||
      deal.status === 'cancelled' ||
      deal.status === 'mutually_closed'
    ) {
      if (deal.resolution === null || deal.amountSats <= 0) continue;
      const payoutRole = ESCROW_SIGNATURE_REQUIREMENTS[deal.resolution].payout;
      const payoutPubkey =
        payoutRole === 'buyer' ? deal.parties.buyerPubkey : deal.parties.sellerPubkey;
      const payoutWallet = findDemoWalletByPublicKey(payoutPubkey);
      if (!payoutWallet) continue;
      mockNetwork.addUtxo(payoutWallet.address, {
        txid: mockTxid(`escrow-out:${deal.id}`),
        vout: 0,
        satoshis: BigInt(deal.amountSats),
      });
    }
  }
}
