// src/types/token.types.ts
export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  balance?: string;
  usdValue?: number;
  price24hChange?: number;
}

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
