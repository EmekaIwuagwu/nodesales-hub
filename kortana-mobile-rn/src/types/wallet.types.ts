// src/types/wallet.types.ts
export interface Account {
  address: string;
  name: string;
  isImported: boolean;
  index: number;
}

export interface WalletState {
  mnemonic?: string;
  accounts: Account[];
  activeAccountIndex: number;
  isLocked: boolean;
  isOnboarded: boolean;
}
