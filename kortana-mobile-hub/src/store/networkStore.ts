import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { NetworkConfig, NetworkState } from '../types/network.types';
import { DEFAULT_NETWORKS, KORTANA_MAINNET } from '../utils/constants';

const { MMKV } = require('react-native-mmkv');
const storage = new MMKV();

const mmkvStorage = {
    setItem: (name: string, value: string) => storage.set(name, value),
    getItem: (name: string) => storage.getString(name) ?? null,
    removeItem: (name: string) => storage.delete(name),
};

interface NetworkActions {
    setActiveNetwork: (network: NetworkConfig) => void;
    addNetwork: (network: NetworkConfig) => void;
    removeNetwork: (chainId: number) => void;
}

export const useNetworkStore = create<NetworkState & NetworkActions>()(
    persist(
        (set) => ({
            activeNetwork: KORTANA_MAINNET,
            networks: DEFAULT_NETWORKS,

            setActiveNetwork: (network) => set({ activeNetwork: network }),
            addNetwork: (network) => set((state) => ({
                networks: [...state.networks, network]
            })),
            removeNetwork: (chainId) => set((state) => ({
                networks: state.networks.filter(n => n.chainId !== chainId)
            })),
        }),
        {
            name: 'network-storage',
            storage: createJSONStorage(() => mmkvStorage),
        }
    )
);
