import { create } from "zustand";
import { persist } from "zustand/middleware";

// Module-level ref for the raw EIP-1193 provider used to log in.
// Not in Zustand state (providers aren't serialisable) — just a plain variable.
let _activeProvider = null;
export function getActiveProvider() { return _activeProvider || window.ethereum || null; }
export function setActiveProvider(p) { _activeProvider = p; }

export const useStore = create(
  persist(
    (set) => ({
      // Wallet / auth state
      walletAddress:   null,
      token:           null,
      isAdmin:         false,

      setWallet: (address) => set({ walletAddress: address }),
      setToken:  (token, isAdmin = false) => set({ token, isAdmin }),
      logout:    () => { _activeProvider = null; set({ token: null, isAdmin: false, walletAddress: null }); },

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
