/**
 * Demo wallets for the chipnet demo.
 *
 * Deterministic P2PKH keypairs derived from each demo email. These are
 * CHIPNET TESTNET keys only — never used for real funds. The address is what
 * gets funded from a chipnet faucet; `getUtxos` from the Electrum provider
 * then reports the balance.
 */
export interface DemoWallet {
  email: string;
  /** Chipnet P2PKH cashaddr (bchtest:...). */
  address: string;
  /** 33-byte compressed public key, hex. */
  publicKey: string;
  /** 32-byte private key, hex (chipnet demo only). */
  privateKey: string;
}

export const DEMO_WALLETS: Record<string, DemoWallet> = {
  'avery@example.com': {
    email: 'avery@example.com',
    address: 'bchtest:qrku0dz8m597vfqezq005y07k7dpl3prryfywm3u3g',
    publicKey: '02ecf3b3ce386950c4d0026c036b84356969afdee269b9433c102180372b0bfe68',
    privateKey: 'd069ac89137bbe10740fb66d986c59c03341db3cdfea4187cd1d1fc190970d2d',
  },
  'buyer@example.com': {
    email: 'buyer@example.com',
    address: 'bchtest:qpuuwnw6msvvc2u4gm56vzpq5lwrmv8luy2ez6zj80',
    publicKey: '03b103a5e1092993a3b7c2d216c1f09470e8b85f0756806e3f66ad2e92619b137c',
    privateKey: 'be83ab30c4225db4e4bf147758e89c011d7775a0ed76f33818b2d2b47d51a19c',
  },
  'seller@example.com': {
    email: 'seller@example.com',
    address: 'bchtest:qqfn49vddrmlf0ldr4qs230r8rd5em729qzpheq85u',
    publicKey: '03eef3edb176cb06876683f92f3f796a54d0cc4a4062478acdc542dda71625736f',
    privateKey: '240898472984a740a698f734b5723d2ffa3e60559b92be549c22b2ed260b7342',
  },
  'demo@example.com': {
    email: 'demo@example.com',
    address: 'bchtest:qrf593wsk4uhwlzdqar4gf2kr5fym69gfcfwdrez6l',
    publicKey: '03388a49946f8f93823eeee41cf9923dcba51541a9821550da86825a9f89997d78',
    privateKey: 'c382da469f965d3a88d4f0027461a89459c2a60b080abcfe6d7c02bcefc126f5',
  },
};

/**
 * Resolve the demo wallet for a logged-in email.
 *
 * Returns `null` when no demo keypair exists for that email — the UI should
 * then show "No wallet connected" rather than crashing or showing $0.
 */
export function getDemoWalletForEmail(email: string | null | undefined): DemoWallet | null {
  if (!email) return null;
  const key = email.trim().toLowerCase();
  return DEMO_WALLETS[key] ?? null;
}
