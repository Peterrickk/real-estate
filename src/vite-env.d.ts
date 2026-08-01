/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BCH_NETWORK: 'mainnet' | 'testnet' | 'chipnet';
  readonly VITE_ELECTRUM_URL?: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
  readonly VITE_PHILSA_COP_PHIL_CATALOGUE?: string;
  readonly VITE_PHILSA_COP_PHIL_S3?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
