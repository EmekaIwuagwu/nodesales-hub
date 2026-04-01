// src/store/network.store.ts
import { create } from 'zustand';
import { Network } from '@app-types/network.types';
import { KORTANA_NETWORK } from '@api/kortana';

interface NetworkStore {
  activeNetworkId: string;
  networks: Network[];
  setActiveNetwork: (id: string) => void;
  addNetwork: (network: Network) => void;
  removeNetwork: (id: string) => void;
}

const DEFAULT_NETWORKS: Network[] = [
  {
    id: 'kortana-mainnet',
    name: KORTANA_NETWORK.chainName,
    chainId: KORTANA_NETWORK.chainId,
    rpcUrl: KORTANA_NETWORK.rpcUrls[0],
    explorerUrl: KORTANA_NETWORK.blockExplorerUrls[0],
    symbol: KORTANA_NETWORK.nativeCurrency.symbol,
    decimals: KORTANA_NETWORK.nativeCurrency.decimals,
    color: '#1A6FFF',
    isTestnet: false,
  },
  {
    id: 'ethereum-mainnet',
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/your-project-id',
    explorerUrl: 'https://etherscan.io',
    symbol: 'ETH',
    decimals: 18,
    color: '#627EEA',
    isTestnet: false,
  },
];

export const useNetworkStore = create<NetworkStore>((set) => ({
  activeNetworkId: 'kortana-mainnet',
  networks: DEFAULT_NETWORKS,
  setActiveNetwork: (id) => set({ activeNetworkId: id }),
  addNetwork: (network) => set((state) => ({ networks: [...state.networks, network] })),
  removeNetwork: (id) => set((state) => ({ 
    networks: state.networks.filter(n => n.id !== id) 
  })),
}));
