export type TransactionType = 'send' | 'receive' | 'swap' | 'approve' | 'contract';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export interface Transaction {
    id: string;
    hash: string;
    type: TransactionType;
    status: TransactionStatus;
    from: string;
    to: string;
    amount: string;
    symbol: string;
    timestamp: number;
    fee?: string;
    chainId: number;
}
