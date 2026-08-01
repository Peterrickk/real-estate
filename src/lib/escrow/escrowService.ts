import { SignatureTemplate, TransactionBuilder } from 'cashscript';
import type { AppData } from '../../data/storage';
import type { FiatDeposit } from '../../modules/funding/types';
import type { Listing } from '../../modules/marketplace/types';
import { findDemoWalletByPublicKey } from '../ownerKeys';
import { usdToSats } from '../rates';
import { recordCompletedSale } from '../saleEvents/recordCompletedSale';
import { ESCROW_FEE_BUFFER_SATS, FUNDING_SURPLUS_SATS, TITLE_COMPANY_ARBITER } from './constants';
import { getEscrowContract, mockNetwork, mockTxid, seedMockNetwork } from './mockNetwork';
import { ESCROW_SIGNATURE_REQUIREMENTS, type EscrowDeal, type EscrowResolution } from './types';

/**
 * Escrow service wired to the compiled `PropertySaleEscrow.cash` contract.
 *
 * Every operation runs against the shared `MockNetworkProvider`:
 *  1. createEscrowDeal()  → real P2SH32 address from the artifact + pubkeys
 *  2. fundEscrow()        → broadcast a tx moving the buyer's UTXOs into the
 *                           contract (spent deposit balance is tracked FIFO)
 *  3. completeSale() / cancelSale() / mutualClose() → spend the contract UTXO
 *                           with the matching signatures, verified by the VM.
 *
 * No external network is contacted and no real BCH moves.
 */

export interface FundEscrowResult {
  deal: EscrowDeal;
  /** Deposits with updated `remainingSats` after the funding spend. */
  deposits: FiatDeposit[];
}

export async function createEscrowDeal(
  listing: Listing,
  buyerPubkey: string,
  amountUsd: number = listing.askingPrice,
): Promise<EscrowDeal> {
  const parties = {
    buyerPubkey,
    sellerPubkey: listing.sellerPubkey,
    ...TITLE_COMPANY_ARBITER,
  };
  const contract = getEscrowContract(parties);

  return {
    id: `escrow-${listing.id}-${Date.now()}`,
    propertyId: listing.propertyId,
    listingId: listing.id,
    contractAddress: contract.address,
    amount: amountUsd,
    amountSats: usdToSats(amountUsd),
    fundedSats: null,
    fundingTxId: null,
    parties,
    status: 'pending_funding',
    resolution: null,
    createdAt: new Date().toISOString(),
    resolvedAt: null,
    resolutionTxId: null,
  };
}

/**
 * Fund the escrow contract from the buyer's completed deposits (FIFO).
 * Returns null when the buyer's balance is insufficient (deal stays pending).
 */
export async function fundEscrow(data: AppData, deal: EscrowDeal): Promise<FundEscrowResult | null> {
  const buyer = findDemoWalletByPublicKey(deal.parties.buyerPubkey);
  if (!buyer || deal.contractAddress === null) return null;

  const fundedSats = BigInt(deal.amountSats) + ESCROW_FEE_BUFFER_SATS;
  const needed = fundedSats + FUNDING_SURPLUS_SATS;

  const buyerDeposits = data.deposits
    .filter(
      (deposit) =>
        deposit.email === buyer.email && deposit.status === 'completed' && deposit.remainingSats > 0,
    )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  let remainingNeeded = needed;
  const consumed: Array<{ deposit: FiatDeposit; newRemaining: number }> = [];
  for (const deposit of buyerDeposits) {
    if (remainingNeeded <= 0n) break;
    const consume = BigInt(Math.min(deposit.remainingSats, Number(remainingNeeded)));
    consumed.push({
      deposit,
      newRemaining: Number(BigInt(deposit.remainingSats) - consume),
    });
    remainingNeeded -= consume;
  }
  if (remainingNeeded > 0n) return null;

  seedMockNetwork(data.deposits, data.escrowDeals);

  const selectedTxids = new Set(consumed.map(({ deposit }) => mockTxid(`dep:${deposit.id}`)));
  const utxos = await mockNetwork.getUtxos(buyer.address);
  const selectedUtxos = utxos.filter((utxo) => selectedTxids.has(utxo.txid));

  const contract = getEscrowContract(deal.parties);
  const tx = new TransactionBuilder({ provider: mockNetwork });
  tx.addInputs(selectedUtxos, new SignatureTemplate(buyer.privateKey).unlockP2PKH());
  tx.addOutput({ to: contract.address, amount: fundedSats });
  tx.addBchChangeOutputIfNeeded({ to: buyer.address, feeRate: 1 });
  const sent = await tx.send();

  const nextRemaining = new Map(consumed.map(({ deposit, newRemaining }) => [deposit.id, newRemaining]));
  const deposits = data.deposits.map((deposit) =>
    nextRemaining.has(deposit.id) ? { ...deposit, remainingSats: nextRemaining.get(deposit.id)! } : deposit,
  );

  return {
    deal: {
      ...deal,
      status: 'funded',
      fundedSats: Number(fundedSats),
      fundingTxId: sent.txid,
    },
    deposits,
  };
}

export async function completeSale(data: AppData, deal: EscrowDeal): Promise<EscrowDeal | null> {
  return resolveEscrow(data, deal, 'completeSale');
}

export async function cancelSale(data: AppData, deal: EscrowDeal): Promise<EscrowDeal | null> {
  return resolveEscrow(data, deal, 'cancelSale');
}

export async function mutualClose(data: AppData, deal: EscrowDeal): Promise<EscrowDeal | null> {
  return resolveEscrow(data, deal, 'mutualClose');
}

async function resolveEscrow(
  data: AppData,
  deal: EscrowDeal,
  resolution: EscrowResolution,
): Promise<EscrowDeal | null> {
  if (deal.contractAddress === null) return null;

  seedMockNetwork(data.deposits, data.escrowDeals);

  const contract = getEscrowContract(deal.parties);
  const contractUtxos = await contract.getUtxos();
  if (contractUtxos.length === 0) return null;

  const requirements = ESCROW_SIGNATURE_REQUIREMENTS[resolution];
  const signatures = requirements.signers.map((role) => {
    const pubkey = role === 'buyer' ? deal.parties.buyerPubkey
      : role === 'seller' ? deal.parties.sellerPubkey
      : deal.parties.arbiterPubkey;
    const wallet = findDemoWalletByPublicKey(pubkey);
    if (!wallet) throw new Error(`No demo keypair registered for escrow ${role}`);
    return new SignatureTemplate(wallet.privateKey);
  });

  const unlocker =
    resolution === 'completeSale'
      ? contract.unlock.completeSale(signatures[0], signatures[1])
      : resolution === 'cancelSale'
        ? contract.unlock.cancelSale(signatures[0], signatures[1])
        : contract.unlock.mutualClose(signatures[0], signatures[1]);

  const payoutPubkey =
    requirements.payout === 'buyer' ? deal.parties.buyerPubkey : deal.parties.sellerPubkey;
  const payoutWallet = findDemoWalletByPublicKey(payoutPubkey);
  if (!payoutWallet) return null;

  const tx = new TransactionBuilder({ provider: mockNetwork });
  tx.addInput(contractUtxos[0], unlocker);
  tx.addOutput({ to: payoutWallet.address, amount: BigInt(deal.amountSats) });
  const sent = await tx.send();

  const resolved: EscrowDeal = {
    ...deal,
    status:
      resolution === 'completeSale'
        ? 'completed'
        : resolution === 'cancelSale'
          ? 'cancelled'
          : 'mutually_closed',
    resolution,
    resolvedAt: new Date().toISOString(),
    resolutionTxId: sent.txid,
  };

  if (resolution === 'completeSale' || resolution === 'mutualClose') {
    recordCompletedSale(resolved);
  }

  return resolved;
}
