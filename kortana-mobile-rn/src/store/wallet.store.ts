// src/store/wallet.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Account, WalletState } from '@app-types/wallet.types';

interface WalletStore extends WalletState {
  setMnemonic: (mnemonic: string) => void;
  setAccounts: (accounts: Account[]) => void;
  addAccount: (account: Account) => void;
  setActiveAccount: (index: number) => void;
  setLocked: (isLocked: boolean) => void;
  setOnboarded: (isOnboarded: boolean) => void;
  resetWallet: () => void;
}

const initialState: WalletState = {
  mnemonic: undefined,
  accounts: [],
  activeAccountIndex: 0,
  isLocked: false,
  isOnboarded: false,
};

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      ...initialState,
      setMnemonic: (mnemonic) => set({ mnemonic }),
      setAccounts: (accounts) => set({ accounts }),
      addAccount: (account) => set((state) => ({ accounts: [...state.accounts, account] })),
      setActiveAccount: (index) => set({ activeAccountIndex: index }),
      setLocked: (isLocked) => set({ isLocked }),
      setOnboarded: (isOnboarded) => set({ isOnboarded }),
      resetWallet: () => set(initialState),
    }),
    {
      name: 'wallet-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        accounts: state.accounts, 
        activeAccountIndex: state.activeAccountIndex,
        isOnboarded: state.isOnboarded,
      }), // Don't persist mnemonic directly here for security, keep it in Keychain, or keep isLocked out
    }
  )
);
