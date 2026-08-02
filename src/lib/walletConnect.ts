// BCH Wallet Connect Configuration for Chipnet Only
const network = "chipnet";

const connectedChain = "bch:bchtest";

// BCH Chipnet configuration
const chipnetConfig = {
  chainId: '0x145',
  name: 'BCH Chipnet',
  currency: 'BCH',
  explorerUrl: 'https://chipnet explorers.com',
  rpcUrl: 'https://chipnet.kutana.io',
};

const chaingraphUrl = 'https://gql.chaingraph.pat.mn/v1/graphql';

export { 
  network, 
  connectedChain, 
  chipnetConfig,
  chaingraphUrl 
};
