export interface Account {
    address: string;
    name: string;
    index: number;
    balance?: string;
    isWatchOnly?: boolean;
}

export interface WalletState {
    accounts: Account[];
    activeAccountIndex: number;
    isLocked: boolean;
    hasWallet: boolean;
}
