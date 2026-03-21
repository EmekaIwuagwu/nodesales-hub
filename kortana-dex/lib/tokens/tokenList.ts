// lib/tokens/tokenList.ts

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  chainId: number;
  tags?: string[];
}

// TESTNET (Chain ID: 72511)
export const TESTNET_TOKENS: Token[] = [
  {
    address: "0x0000000000000000000000000000000000000000", // Native DNR
    symbol: "DNR",
    name: "Kortana Dinar",
    decimals: 18,
    logoURI: "/tokens/dnr.png",
    chainId: 72511,
    tags: ["native"],
  },
  {
    address: process.env.NEXT_PUBLIC_DNRS_ADDRESS_TESTNET || "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Placeholder
    symbol: "DNRS",
    name: "Kortana Dinar Stable",
    decimals: 18,
    logoURI: "/tokens/dnrs.png",
    chainId: 72511,
    tags: ["stablecoin"],
  },
  {
    address: process.env.NEXT_PUBLIC_USDT_ADDRESS_TESTNET || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // Placeholder
    symbol: "USDT",
    name: "Tether USD (Testnet)",
    decimals: 6,
    logoURI: "/tokens/usdt.png",
    chainId: 72511,
    tags: ["stablecoin"],
  },
];

// MAINNET (Chain ID: 9002)
export const MAINNET_TOKENS: Token[] = [
  {
    address: "0x0000000000000000000000000000000000000000",
    symbol: "DNR",
    name: "Kortana Dinar",
    decimals: 18,
    logoURI: "/tokens/dnr.png",
    chainId: 9002,
    tags: ["native"],
  },
  {
    address: process.env.NEXT_PUBLIC_DNRS_ADDRESS_MAINNET || "0x0000000000000000000000000000000000000000",
    symbol: "DNRS",
    name: "Kortana Dinar Stable",
    decimals: 18,
    logoURI: "/tokens/dnrs.png",
    chainId: 9002,
    tags: ["stablecoin"],
  },
  {
    address: process.env.NEXT_PUBLIC_USDT_ADDRESS_MAINNET || "0x0000000000000000000000000000000000000000",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    logoURI: "/tokens/usdt.png",
    chainId: 9002,
    tags: ["stablecoin"],
  },
];

// Convenience exports
export const DNR_TOKEN = TESTNET_TOKENS[0];
export const DNRS_TOKEN = TESTNET_TOKENS[1];
export const USDT_TOKEN = TESTNET_TOKENS[2];
