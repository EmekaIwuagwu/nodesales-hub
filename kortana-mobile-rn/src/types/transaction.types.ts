// src/types/transaction.types.ts
export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  symbol: string;
  timestamp: number;
  status: TransactionStatus;
  type: 'SENT' | 'RECEIVED';
  tokenAddress?: string;
  gasUsed?: string;
  gasPrice?: string;
}
