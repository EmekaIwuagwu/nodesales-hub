// src/api/kortana.ts
import { ethers } from 'ethers';
import { KORTANA_RPC_URL, KORTANA_CHAIN_ID } from '@env';

export const KORTANA_NETWORK = {
  chainId: parseInt(KORTANA_CHAIN_ID || '1', 10),
  chainName: 'Kortana Mainnet',
  nativeCurrency: {
    name: 'Kortana',
    symbol: 'DNR',
    decimals: 18,
  },
  rpcUrls: [KORTANA_RPC_URL || 'https://rpc.kortana.network'],
  blockExplorerUrls: ['https://scan.kortana.network'],
};

export const getProvider = (rpcUrl?: string): ethers.JsonRpcProvider => {
  return new ethers.JsonRpcProvider(rpcUrl || KORTANA_NETWORK.rpcUrls[0]);
};
