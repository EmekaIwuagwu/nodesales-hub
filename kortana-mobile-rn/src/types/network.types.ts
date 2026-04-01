// src/types/network.types.ts
export interface Network {
  id: string;
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl?: string;
  symbol: string;
  decimals: number;
  color: string;
  isTestnet: boolean;
}
