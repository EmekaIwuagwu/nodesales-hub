// src/store/transaction.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '@app-types/transaction.types';

interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  clearTransactions: () => void;
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set) => ({
      transactions: [],
      addTransaction: (tx) => 
        set((state) => ({ 
          transactions: [tx, ...state.transactions].slice(0, 50) // Keep last 50
        })),
      clearTransactions: () => set({ transactions: [] }),
    }),
    {
      name: 'kortana-transaction-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
