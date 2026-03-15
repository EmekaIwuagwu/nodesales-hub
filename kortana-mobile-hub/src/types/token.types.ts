export interface Token {
    id: string;
    symbol: string;
    name: string;
    icon?: string;
    balance: string;
    valueUsd: string;
    priceUsd: string;
    change24h: number;
}
