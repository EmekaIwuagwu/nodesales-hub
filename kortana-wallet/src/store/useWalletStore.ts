import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { NetworkType } from '../lib/constants';
import { chromeStorage } from './chromeStorage';

interface WalletState {
    // Persistent State (Encrypted/Public)
    address: string | null;
    encryptedMnemonic: string | null;
    passwordHash: string | null;
    accounts: string[];
    network: NetworkType;
    tokens: any[];

    // Memory-only State (Cleared on lock)
    mnemonic: string | null;
    privateKey: string | null;
    isLocked: boolean;
    balance: string;
    lastInteraction: number;

    // Hydration tracking (not persisted)
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;

    // Actions
    setAddress: (address: string | null) => void;
    setEncryptedMnemonic: (encrypted: string | null) => void;
    setPasswordHash: (hash: string | null) => void;
    setNetwork: (network: NetworkType) => void;
    setLocked: (isLocked: boolean) => void;
    setBalance: (balance: string) => void;
    setTokens: (tokens: any[]) => void;
    setMnemonic: (mnemonic: string | null) => void;
    setPrivateKey: (key: string | null) => void;
    updateLastInteraction: () => void;
    addAccount: (address: string) => void;
    reset: () => void;
}

export const useWalletStore = create<WalletState>()(
    persist(
        (set) => ({
            // Defaults
            address: null,
            encryptedMnemonic: null,
            passwordHash: null,
            accounts: [],
            network: 'mainnet',
            tokens: [],
            mnemonic: null,
            privateKey: null,
            isLocked: true,
            balance: '0.00',
            lastInteraction: Date.now(),

            // Hydration flag — starts false, set to true in onRehydrateStorage
            _hasHydrated: false,
            setHasHydrated: (state) => set({ _hasHydrated: state }),

            // Setters
            setAddress: (address) => set({ address }),
            setEncryptedMnemonic: (encryptedMnemonic) => set({ encryptedMnemonic }),
            setPasswordHash: (passwordHash) => set({ passwordHash }),
            setNetwork: (network) => set({ network }),
            setLocked: (isLocked) => {
                if (isLocked) {
                    set({ isLocked, mnemonic: null, privateKey: null });
                } else {
                    set({ isLocked });
                }
            },
            setBalance: (balance) => set({ balance }),
            setTokens: (tokens) => set({ tokens }),
            setMnemonic: (mnemonic) => set({ mnemonic }),
            setPrivateKey: (privateKey) => set({ privateKey }),
            updateLastInteraction: () => set({ lastInteraction: Date.now() }),

            addAccount: (address) => set((state) => ({
                accounts: state.accounts.includes(address)
                    ? state.accounts
                    : [...state.accounts, address]
            })),

            reset: () => set({
                address: null,
                encryptedMnemonic: null,
                passwordHash: null,
                accounts: [],
                network: 'mainnet',
                tokens: [],
                mnemonic: null,
                privateKey: null,
                isLocked: true,
                balance: '0.00',
            }),
        }),
        {
            name: 'kortana-wallet-secure-storage',
            storage: createJSONStorage(() => chromeStorage),
            partialize: (state) => ({
                address: state.address,
                encryptedMnemonic: state.encryptedMnemonic,
                passwordHash: state.passwordHash,
                accounts: state.accounts,
                network: state.network,
                tokens: state.tokens,
                isLocked: state.isLocked,
                // NOTE: _hasHydrated is intentionally NOT persisted
            }),
            onRehydrateStorage: () => (state) => {
                // This callback fires when async storage read completes.
                // state may be undefined if storage was empty (first install).
                state?.setHasHydrated(true);
            },
        }
    )
);
