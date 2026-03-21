"use client";

import React, { useState, useEffect } from "react";
import "@rainbow-me/rainbowkit/styles.css";
import {
  RainbowKitProvider,
  darkTheme,
  connectorsForWallets,
  Wallet,
} from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { WagmiProvider, http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { kortanaTestnet, kortanaMainnet } from "../lib/constants/chains";

const projectId = "YOUR_PROJECT_ID"; 

// Premium Native Ecosystem Handshake (BelloMundo Style)
const kortanaWallet = (): Wallet => ({
  id: "kortana",
  name: "Kortana Wallet",
  iconUrl: "https://www.kortana.network/favicon.ico",
  iconBackground: "#050505",
  downloadUrls: {
    chrome: "https://chromewebstore.google.com/detail/kortana-wallet/efbbdbedokefmdafkkddahekohlimdep",
  },
  createConnector: (walletDetails) => {
    // Direct window.kortana target for 1:1 parity with BelloMundo handshake
    return injected({
      target: () => (typeof window !== "undefined" ? (window as any).kortana : undefined),
    });
  },
});

const connectors = connectorsForWallets([
  {
    groupName: "Kortana Ecosystem",
    wallets: [
      kortanaWallet,
    ],
  },
  {
    groupName: "Universal Wallets",
    wallets: [
      metaMaskWallet,
      rainbowWallet,
      walletConnectWallet,
    ],
  },
], {
  appName: "KORTANA EXCHANGE",
  projectId,
});

const config = createConfig({
  connectors,
  chains: [kortanaTestnet, kortanaMainnet],
  transports: {
    [kortanaTestnet.id]: http(),
    [kortanaMainnet.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function KortanaProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
