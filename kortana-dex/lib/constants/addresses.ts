// lib/constants/addresses.ts

export const CONTRACT_ADDRESSES = {
  72511: { // Testnet
    factory: process.env.NEXT_PUBLIC_FACTORY_ADDRESS_TESTNET || "0x7416CB94704Ce941795Feb58B41D3B97160C453F",
    router: process.env.NEXT_PUBLIC_SWAP_ROUTER_ADDRESS_TESTNET || "0x9A6226c3EBEa21efb8C9c69c4f160EBf1Ac576ef",
    positionManager: process.env.NEXT_PUBLIC_POSITION_MANAGER_ADDRESS_TESTNET || "0xeD2EA479C7Ccc12dBF8FcF39a6d99A17C1f4FCF9",
    wdnr: process.env.NEXT_PUBLIC_WDNR_ADDRESS_TESTNET || "0xa9f4C43D113332123FAc2b6574767A6B00067d7e",
    quoter: process.env.NEXT_PUBLIC_QUOTER_V2_ADDRESS_TESTNET || "",
  },
  9002: { // Mainnet
    factory: process.env.NEXT_PUBLIC_FACTORY_ADDRESS_MAINNET || "",
    router: process.env.NEXT_PUBLIC_SWAP_ROUTER_ADDRESS_MAINNET || "",
    positionManager: process.env.NEXT_PUBLIC_POSITION_MANAGER_ADDRESS_MAINNET || "",
    wdnr: process.env.NEXT_PUBLIC_WDNR_ADDRESS_MAINNET || "",
    quoter: process.env.NEXT_PUBLIC_QUOTER_V2_ADDRESS_MAINNET || "",
  }
};

export const getContractAddress = (chainId: number, key: keyof typeof CONTRACT_ADDRESSES[72511]) => {
  return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.[key] || "";
};
