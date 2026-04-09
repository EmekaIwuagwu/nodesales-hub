"use client";

import { useEffect } from "react";
import { useAccount, useSwitchChain } from "wagmi";

const KORTANA_TESTNET_ID = 72511;

export function NetworkGuard() {
  const { isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    // As soon as the user connects, if they are not on Kortana Testnet, switch automatically
    if (isConnected && chain?.id !== KORTANA_TESTNET_ID) {
      console.log(`NetworkGuard: Detected chain ${chain?.id ?? "unknown"}, switching to Kortana Testnet...`);
      switchChain?.({ chainId: KORTANA_TESTNET_ID });
    }
  }, [isConnected, chain?.id]);

  return null; // This component renders nothing — it's purely a side-effect guard
}
