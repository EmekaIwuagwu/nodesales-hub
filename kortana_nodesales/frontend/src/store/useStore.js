import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useStore = create(
  persist(
    (set) => ({
      // Wallet / auth state
      walletAddress:   null,
      token:           null,
      isAdmin:         false,

      setWallet: (address) => set({ walletAddress: address }),
      setToken:  (token, isAdmin = false) => set({ token, isAdmin }),
      logout:    () => set({ token: null, isAdmin: false, walletAddress: null }),

      // Wallet-selection modal (non-persisted)
      walletModalOpen:  false,
      openWalletModal:  () => set({ walletModalOpen: true }),
      closeWalletModal: () => set({ walletModalOpen: false }),
    }),
    {
      name:       "kortana-auth",
      partialize: (s) => ({ token: s.token, isAdmin: s.isAdmin, walletAddress: s.walletAddress }),
    }
  )
);
