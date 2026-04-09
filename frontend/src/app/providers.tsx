"use client";

import * as React from "react";
import {
  RainbowKitProvider,
  darkTheme,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import { 
  metaMaskWallet, 
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { kortanaWallet } from "@/lib/wallets";
import { NetworkGuard } from "@/components/layout/NetworkGuard";

const queryClient = new QueryClient();

const kortanaTestnet = {
  id: 72511,
  name: "Kortana Testnet",
  nativeCurrency: { name: "DNR", symbol: "DNR", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://poseidon-rpc.testnet.kortana.xyz/"] },
  },
  blockExplorers: {
    default: {
      name: "Kortana Explorer",
      url: "https://explorer.testnet.kortana.xyz",
    },
  },
  testnet: true,
} as const;

const kortanaMainnet = {
  id: 9002,
  name: "Kortana Mainnet",
  nativeCurrency: { name: "DNR", symbol: "DNR", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://zeus-rpc.mainnet.kortana.xyz"] },
  },
  blockExplorers: {
    default: {
      name: "Kortana Explorer",
      url: "https://explorer.mainnet.kortana.xyz",
    },
  },
} as const;

const projectId = "ea32dbec78cc38ee359dff1fde20e104";

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Kortana Native',
      wallets: [kortanaWallet],
    },
    {
      groupName: 'Popular',
      wallets: [
        metaMaskWallet,
        walletConnectWallet,
      ],
    },
  ],
  {
    appName: 'KortanaDEX',
    projectId,
  }
);

const config = createConfig({
  connectors,
  chains: [kortanaTestnet, kortanaMainnet],
  transports: {
    [kortanaTestnet.id]: http(),
    [kortanaMainnet.id]: http(),
  },
  ssr: true,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#F5C842",
            accentColorForeground: "black",
            borderRadius: "large",
            overlayBlur: "small",
          })}
        >
          {mounted && (
            <>
              <NetworkGuard />
              {children}
            </>
          )}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
