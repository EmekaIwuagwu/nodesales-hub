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
    address: "0x0000000000000000000000000000000000000000",
    symbol: "DNR",
    name: "Kortana Dinar",
    decimals: 18,
    logoURI: "/tokens/dnr.png",
    chainId: 72511,
    tags: ["native"],
  },
  {
    address: process.env.NEXT_PUBLIC_WDNR_ADDRESS_TESTNET || "0xa9f4C43D113332123FAc2b6574767A6B00067d7e",
    symbol: "WDNR",
    name: "Wrapped Kortana Dinar",
    decimals: 18,
    logoURI: "/tokens/wdnr.png",
    chainId: 72511,
    tags: ["wrapped"],
  },
  {
    address: "0xa1E9679c7AE524a09AbE34464A99d8D5daaEA92B", // Official DNRS from kortana-dnrs project
    symbol: "DNRS",
    name: "Kortana Dinar Stable",
    decimals: 18,
    logoURI: "/tokens/dnrs.png",
    chainId: 72511,
    tags: ["stablecoin"],
  },
  {
    address: "0x17A784f080Af594280a6F9871E658B99ccE364F3", // MockDNR used as USDT for now
    symbol: "USDT",
    name: "Tether USD (Testnet)",
    decimals: 18,
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
];

// Convenience exports
export const DNR_TOKEN = TESTNET_TOKENS[0];
export const WDNR_TOKEN = TESTNET_TOKENS[1];
export const DNRS_TOKEN = TESTNET_TOKENS[2];
export const USDT_TOKEN = TESTNET_TOKENS[3];
