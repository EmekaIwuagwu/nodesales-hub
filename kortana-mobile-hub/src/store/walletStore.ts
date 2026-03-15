import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Account, WalletState } from '../types/wallet.types';

const { MMKV } = require('react-native-mmkv');
const storage = new MMKV();

const mmkvStorage = {
    setItem: (name: string, value: string) => storage.set(name, value),
    getItem: (name: string) => storage.getString(name) ?? null,
    removeItem: (name: string) => storage.delete(name),
};

interface WalletActions {
    setHasWallet: (hasWallet: boolean) => void;
    setLocked: (isLocked: boolean) => void;
    addAccount: (account: Account) => void;
    switchAccount: (index: number) => void;
    resetWallet: () => void;
}

export const useWalletStore = create<WalletState & WalletActions>()(
    persist(
        (set) => ({
            accounts: [],
            activeAccountIndex: 0,
            isLocked: true,
            hasWallet: false,

            setHasWallet: (hasWallet) => set({ hasWallet }),
            setLocked: (isLocked) => set({ isLocked }),
            addAccount: (account) => set((state) => ({
                accounts: [...state.accounts, account]
            })),
            switchAccount: (index) => set({ activeAccountIndex: index }),
            resetWallet: () => set({ accounts: [], activeAccountIndex: 0, hasWallet: false, isLocked: true }),
        }),
        {
            name: 'wallet-storage',
            storage: createJSONStorage(() => mmkvStorage),
        }
    )
);
