// src/store/token.store.ts
import { create } from 'zustand';

export interface Token {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
  networkId: string;
}

interface TokenStore {
  customTokens: Token[];
  addToken: (token: Token) => void;
  removeToken: (address: string, networkId: string) => void;
  resetTokens: () => void;
}

export const useTokenStore = create<TokenStore>((set) => ({
  customTokens: [],
  addToken: (token) => set((state) => ({ 
    customTokens: [...state.customTokens.filter(t => t.address !== token.address || t.networkId !== token.networkId), token] 
  })),
  removeToken: (address, networkId) => set((state) => ({
    customTokens: state.customTokens.filter(t => t.address !== address || t.networkId !== networkId)
  })),
  resetTokens: () => set({ customTokens: [] }),
}));
