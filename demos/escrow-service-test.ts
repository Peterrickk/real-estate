/**
 * Integration test for the app's escrow service layer.
 *
 * Exercises the exact service modules the UI calls (`escrowService.ts` +
 * `mockNetwork.ts`) against the real PropertySaleEscrow artifact and the
 * in-memory MockNetworkProvider — create → fund (FIFO from deposits) → resolve
 * via all three signature paths.
 *
 * Build with Vite SSR (to resolve extensionless source imports) then run the
 * emitted bundle in Node:
 *   npx vite build --ssr demos/escrow-service-test.ts --outDir .ssr-test
 *   node .ssr-test/escrow-service-test.js
 */
import assert from 'node:assert/strict';
import {
  cancelSale,
  completeSale,
  createEscrowDeal,
  fundEscrow,
  mutualClose,
} from '../src/lib/escrow/escrowService';
import { mockNetwork } from '../src/lib/escrow/mockNetwork';
import { FUNDING_SURPLUS_SATS } from '../src/lib/escrow/constants';
import { DEMO_SELLER_PUBKEY, DEMO_WALLETS } from '../src/lib/ownerKeys';
import { usdToSats } from '../src/lib/rates';
import type { AppData } from '../src/data/storage';
import type { FiatDeposit } from '../src/modules/funding/types';
import type { Listing } from '../src/modules/marketplace/types';

const buyer = DEMO_WALLETS['buyer@example.com'];
const seller = DEMO_WALLETS['seller@example.com'];

const listing: Listing = {
  id: 'lis-test-1',
  propertyId: 'prop-001',
  address: '742 Test St, Pacific Heights',
  size: '2,600 sq ft',
  askingPrice: 485_000,
  sellerPubkey: DEMO_SELLER_PUBKEY,
  listedAt: '2026-01-01T00:00:00.000Z',
};

function makeDeposit(id: string, fiat: number, createdAt: string): FiatDeposit {
  return {
    id,
    email: buyer.email,
    method: 'card',
    fiatAmount: fiat,
    fiatCurrency: 'USD',
    grossSats: usdToSats(fiat),
    feeSats: 0,
    creditedSats: usdToSats(fiat),
    remainingSats: usdToSats(fiat),
    rateBchPerUsd: 100,
    status: 'completed',
    createdAt,
    completedAt: createdAt,
  };
}

function makeData(deposits: FiatDeposit[], escrowDeals = []): AppData {
  return {
    properties: [],
    listings: [listing],
    escrowDeals,
    transferHistory: {},
    priceHistory: {},
    valuationSummaries: {},
    offers: [],
    deposits,
  };
}

async function walletBalance(address: string): Promise<bigint> {
  const utxos = await mockNetwork.getUtxos(address);
  return utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0n);
}

async function main() {
  const amountSats = usdToSats(listing.askingPrice);
  const fundedSats = amountSats + 2_000;
  const results: string[] = [];

  {
    // createEscrowDeal produces a real P2SH32 address + exact satoshi math.
    const deal = await createEscrowDeal(listing, buyer.publicKey);
    assert.ok(deal.contractAddress, 'contractAddress set');
    assert.ok(deal.contractAddress.startsWith('bchtest:p'), 'P2SH32 address');
    assert.strictEqual(deal.status, 'pending_funding');
    assert.strictEqual(deal.amountSats, amountSats);
    assert.strictEqual(deal.fundedSats, null);
    results.push('createEscrowDeal -> P2SH32 contract address + amountSats math');
  }

  {
    // fundEscrow consumes deposits FIFO and leaves the contract with a UTXO.
    const d1 = makeDeposit('dep-1', 200_000, '2026-01-01T00:00:00.000Z');
    const d2 = makeDeposit('dep-2', 400_000, '2026-01-02T00:00:00.000Z');
    const data = makeData([d1, d2]);

    const deal = await createEscrowDeal(listing, buyer.publicKey);
    const funded = await fundEscrow(data, deal);
    assert.ok(funded, 'funding succeeded');
    assert.strictEqual(funded.deal.status, 'funded');
    assert.strictEqual(funded.deal.fundedSats, fundedSats);
    assert.ok(funded.deal.fundingTxId, 'funding tx id set');

    const d1After = funded.deposits.find((d) => d.id === 'dep-1')!;
    const d2After = funded.deposits.find((d) => d.id === 'dep-2')!;
    assert.strictEqual(d1After.remainingSats, 0, 'dep-1 fully consumed first');
    assert.strictEqual(
      d2After.remainingSats,
      d2.remainingSats - (fundedSats + 10_000 - d1.remainingSats),
      'dep-2 partially consumed for the remainder',
    );
    results.push(
      `fundEscrow -> FIFO consumed deposits, contract UTXO = ${funded.deal.fundedSats} sats`,
    );

    // completeSale (seller + arbiter signatures) pays the seller.
    const resolved = await completeSale(
      { ...data, deposits: funded.deposits, escrowDeals: [funded.deal] },
      funded.deal,
    );
    assert.ok(resolved, 'resolution succeeded');
    assert.strictEqual(resolved.status, 'completed');
    assert.strictEqual(resolved.resolution, 'completeSale');
    assert.ok(resolved.resolutionTxId, 'resolution tx id set');
    const sellerBalance = await walletBalance(seller.address);
    assert.ok(sellerBalance >= BigInt(amountSats), `seller paid (${sellerBalance} sats)`);
    results.push('completeSale -> seller+arbiter sigs verified, seller paid');
  }

  {
    // cancelSale (buyer + arbiter) returns funds to the buyer.
    const d = makeDeposit('dep-3', 500_000, '2026-01-03T00:00:00.000Z');
    const data = makeData([d]);
    const deal = await createEscrowDeal(listing, buyer.publicKey);
    const funded = await fundEscrow(data, deal);
    assert.ok(funded);
    const before = await walletBalance(buyer.address);
    const resolved = await cancelSale(
      { ...data, deposits: funded.deposits, escrowDeals: [funded.deal] },
      funded.deal,
    );
    assert.ok(resolved);
    assert.strictEqual(resolved.status, 'cancelled');
    const after = await walletBalance(buyer.address);
    // Re-seeding projects deposits as `remaining - (fundedSats + surplus)`, so
    // the funding change's surplus slack is not reflected in the projection.
    assert.ok(
      after >= before + BigInt(amountSats) - FUNDING_SURPLUS_SATS,
      'buyer refunded',
    );
    results.push('cancelSale -> buyer+arbiter sigs verified, buyer refunded');
  }

  {
    // mutualClose (buyer + seller) pays the seller without the arbiter.
    const d = makeDeposit('dep-4', 500_000, '2026-01-04T00:00:00.000Z');
    const data = makeData([d]);
    const deal = await createEscrowDeal(listing, buyer.publicKey);
    const funded = await fundEscrow(data, deal);
    assert.ok(funded);
    const before = await walletBalance(seller.address);
    const resolved = await mutualClose(
      { ...data, deposits: funded.deposits, escrowDeals: [funded.deal] },
      funded.deal,
    );
    assert.ok(resolved);
    assert.strictEqual(resolved.status, 'mutually_closed');
    const after = await walletBalance(seller.address);
    assert.ok(after >= before + BigInt(amountSats), 'seller paid via mutual close');
    results.push('mutualClose -> buyer+seller sigs verified, seller paid');
  }

  {
    // Insufficient deposits -> fundEscrow returns null (deal stays pending).
    const d = makeDeposit('dep-5', 1, '2026-01-05T00:00:00.000Z');
    const data = makeData([d]);
    const deal = await createEscrowDeal(listing, buyer.publicKey);
    const funded = await fundEscrow(data, deal);
    assert.strictEqual(funded, null, 'insufficient funds leaves deal pending');
    results.push('fundEscrow -> null when deposits cannot cover the deal');
  }

  console.log('\n=== escrow-service integration test ===\n');
  for (const result of results) console.log(`  PASS  ${result}`);
  console.log('\nAll escrow-service assertions passed.');
}

main().catch((error) => {
  console.error('TEST FAILED:', error);
  process.exit(1);
});
