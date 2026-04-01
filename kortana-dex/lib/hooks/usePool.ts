// lib/hooks/usePool.ts
"use client";

import { useReadContract, useChainId } from "wagmi";
import { FACTORY_ABI, POOL_ABI } from "../constants/abis";
import { getContractAddress } from "../constants/addresses";
import { WDNR_TOKEN, Token } from "../tokens/tokenList";
import { useMemo, useEffect } from "react";
import { formatUnits } from "viem";

export function usePool(token0: Token, token1: Token) {
  const chainId = useChainId();
  const factoryAddress = getContractAddress(chainId, "factory") as `0x${string}`;

  // Ensure addresses are sorted for the Factory call
  const [addressA, addressB] = useMemo(() => {
    return token0.address.toLowerCase() < token1.address.toLowerCase()
      ? [token0.address as `0x${string}`, token1.address as `0x${string}`]
      : [token1.address as `0x${string}`, token0.address as `0x${string}`];
  }, [token0.address, token1.address]);

  // Find pool address
  const { data: poolAddress, isLoading: isAddrLoading, error: addrError } = useReadContract({
    address: factoryAddress,
    abi: FACTORY_ABI,
    functionName: "getPool",
    args: [addressA, addressB, 3000], // 0.3% tier
    query: {
        enabled: !!factoryAddress && !!addressA && !!addressB
    }
  });

  useEffect(() => {
    if (poolAddress) {
      console.log("🎯 Factory getPool:", poolAddress, "for", token0.symbol, "/", token1.symbol);
    } else if (addrError) {
      console.error("❌ getPool failed:", addrError);
    }
  }, [poolAddress, addrError, token0.symbol, token1.symbol]);

  // Fetch pool price (slot0)
  const { data: slot0, isLoading: isSlotLoading, refetch: refetchSlot } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: POOL_ABI,
    functionName: "slot0",
    query: {
      enabled: !!poolAddress && poolAddress !== "0x0000000000000000000000000000000000000000",
    }
  });

  const price = useMemo(() => {
    if (!slot0) return undefined;
    
    // slot0: [sqrtPriceX96, tick, ...]
    const sqrtPriceX96 = (slot0 as any)[0];
    if (!sqrtPriceX96 || sqrtPriceX96 === BigInt(0)) {
        console.warn("⚠️ Pool detected but price/liquidity not initialized yet.");
        return undefined;
    }

    const ratio = Number(sqrtPriceX96) / Math.pow(2, 96);
    let p = ratio * ratio;

    // If the pool's token0 is actually our token1, invert the price
    if (token0.address.toLowerCase() > token1.address.toLowerCase()) {
      p = 1 / p;
    }

    console.log("📈 Discovery Price:", p, "for", token0.symbol, "/", token1.symbol);
    return p;
  }, [slot0, token0.address, token1.address, token0.symbol, token1.symbol]);

  return {
    price,
    poolAddress,
    isLoading: isAddrLoading || isSlotLoading,
    refetch: refetchSlot,
  };
}
