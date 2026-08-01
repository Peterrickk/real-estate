/**
 * PropertySaleEscrow demo — runs the full deploy → fund → resolve lifecycle
 * against CashScript's in-memory MockNetworkProvider.
 *
 * No external server is contacted and no real BCH moves; every transaction is
 * built with the real contract artifact and the CashScript VM verifies each
 * signature locally.
 *
 * Run with: npm run demo:PropertySaleEscrow
 */
import { readFileSync } from 'node:fs';
import {
  Contract,
  MockNetworkProvider,
  SignatureTemplate,
  TransactionBuilder,
  type Artifact,
  type TransactionDetails,
} from 'cashscript';

const artifact = JSON.parse(
  readFileSync(new URL('../artifacts/PropertySaleEscrow.json', import.meta.url), 'utf8'),
) as Artifact;

// Demo chipnet keypairs (buyer / seller / title company).
const buyer = {
  publicKey: '03b103a5e1092993a3b7c2d216c1f09470e8b85f0756806e3f66ad2e92619b137c',
  privateKey: 'be83ab30c4225db4e4bf147758e89c011d7775a0ed76f33818b2d2b47d51a19c',
  address: 'bchtest:qpuuwnw6msvvc2u4gm56vzpq5lwrmv8luy2ez6zj80',
};
const seller = {
  publicKey: '03eef3edb176cb06876683f92f3f796a54d0cc4a4062478acdc542dda71625736f',
  privateKey: '240898472984a740a698f734b5723d2ffa3e60559b92be549c22b2ed260b7342',
  address: 'bchtest:qqfn49vddrmlf0ldr4qs230r8rd5em729qzpheq85u',
};
const arbiter = {
  publicKey: '03702070626882f3eceb1420f7b8f7c974f5e2c5474d1e41a39da9bc61be5faae9',
  privateKey: '0c1a4b6af6834768a6d7dd9997de91c330b06c97e761e72e3458c923aa71ec00',
};

const AMOUNT_SATS = 1_000_000n;
const FEE_BUFFER = 2_000n;
const FUNDED_SATS = AMOUNT_SATS + FEE_BUFFER;

/** Send the buyer's UTXOs into the contract (deploy + fund). */
async function fundContract(
  provider: MockNetworkProvider,
  contract: Contract<Artifact>,
): Promise<TransactionDetails> {
  const utxos = await provider.getUtxos(buyer.address);
  const tx = new TransactionBuilder({ provider });
  tx.addInputs(utxos, new SignatureTemplate(buyer.privateKey).unlockP2PKH());
  tx.addOutput({ to: contract.address, amount: FUNDED_SATS });
  tx.addBchChangeOutputIfNeeded({ to: buyer.address, feeRate: 1 });
  return tx.send();
}

/** Spend the contract UTXO via one of the three signature paths. */
async function spendContract(
  provider: MockNetworkProvider,
  contract: Contract<Artifact>,
  name: 'completeSale' | 'cancelSale' | 'mutualClose',
  signerA: { privateKey: string },
  signerB: { privateKey: string },
  payoutAddress: string,
): Promise<TransactionDetails> {
  const utxos = await contract.getUtxos();
  const tx = new TransactionBuilder({ provider });
  const unlocker =
    name === 'completeSale'
      ? contract.unlock.completeSale(
          new SignatureTemplate(signerA.privateKey),
          new SignatureTemplate(signerB.privateKey),
        )
      : name === 'cancelSale'
        ? contract.unlock.cancelSale(
            new SignatureTemplate(signerA.privateKey),
            new SignatureTemplate(signerB.privateKey),
          )
        : contract.unlock.mutualClose(
            new SignatureTemplate(signerA.privateKey),
            new SignatureTemplate(signerB.privateKey),
          );
  tx.addInput(utxos[0], unlocker);
  tx.addOutput({ to: payoutAddress, amount: AMOUNT_SATS });
  return tx.send();
}

async function main() {
  const provider = new MockNetworkProvider({ updateUtxoSet: true });
  const contract = new Contract(artifact, [buyer.publicKey, seller.publicKey, arbiter.publicKey], {
    provider,
  });

  console.log('\n=== PropertySaleEscrow demo (MockNetworkProvider) ===\n');
  console.log(`Contract address: ${contract.address}`);

  // Seed the buyer with enough for 3 funded escrows.
  provider.addUtxo(buyer.address, {
    txid: '11'.repeat(32),
    vout: 0,
    satoshis: FUNDED_SATS * 3n + 100_000n,
  });
  console.log(`Buyer seeded at ${buyer.address}\n`);

  for (const path of [
    { name: 'completeSale' as const, signers: [seller, arbiter], payout: seller },
    { name: 'cancelSale' as const, signers: [buyer, arbiter], payout: buyer },
    { name: 'mutualClose' as const, signers: [buyer, seller], payout: seller },
  ]) {
    const funded = await fundContract(provider, contract);
    console.log(`${path.name}: funded escrow in tx ${funded.txid}`);

    const spent = await spendContract(
      provider,
      contract,
      path.name,
      path.signers[0],
      path.signers[1],
      path.payout.address,
    );
    const balance = (await provider.getUtxos(path.payout.address)).reduce(
      (sum, utxo) => sum + utxo.satoshis,
      0n,
    );
    console.log(`${path.name}: spent in tx ${spent.txid}, payout → ${balance} sats at ${path.payout.address.slice(0, 20)}…`);
    console.log('');
  }

  console.log('Demo complete — all three signature paths verified by the CashScript VM.');
}

main().catch((error) => {
  console.error('Demo failed:', error);
  process.exit(1);
});
