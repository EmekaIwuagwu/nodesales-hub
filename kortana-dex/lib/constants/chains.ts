import { defineChain } from "viem";

export const kortanaTestnet = defineChain({
  id: 72511,
  name: "Kortana Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Kortana Dinar",
    symbol: "DNR",
  },
  rpcUrls: {
    default: {
      http: ["https://poseidon-rpc.testnet.kortana.xyz/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Kortana Testnet Explorer",
      url: "https://explorer.testnet.kortana.xyz",
    },
  },
  testnet: true,
});

export const kortanaMainnet = defineChain({
  id: 9002,
  name: "Kortana",
  nativeCurrency: {
    decimals: 18,
    name: "Kortana Dinar",
    symbol: "DNR",
  },
  rpcUrls: {
    default: {
      http: ["https://zeus-rpc.mainnet.kortana.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Kortana Explorer",
      url: "https://explorer.mainnet.kortana.xyz",
    },
  },
  testnet: false,
});
