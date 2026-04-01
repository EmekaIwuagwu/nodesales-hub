// lib/hooks/usePositions.ts
"use client";

import { useAccount, useReadContract, useChainId, useReadContracts } from "wagmi";
import { POSITIONS_MANAGER_ABI, ERC20_ABI } from "../constants/abis";
import { getContractAddress } from "../constants/addresses";
import { TESTNET_TOKENS } from "../tokens/tokenList";
import { useMemo } from "react";

export interface Position {
  tokenId: number;
  token0: string;
  token1: string;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
}

export function usePositions() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const managerAddress = getContractAddress(chainId, "positionManager") as `0x${string}`;

  // 1. Get balance of NFTs
  const { data: balance, isLoading: isBalanceLoading } = useReadContract({
    address: managerAddress,
    abi: POSITIONS_MANAGER_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address && !!managerAddress }
  });

  // 2. Get the first tokenId (for demo purposes, we'll fetch the first one)
  const { data: firstTokenId, isLoading: isTokenIdLoading } = useReadContract({
    address: managerAddress,
    abi: POSITIONS_MANAGER_ABI,
    functionName: "tokenOfOwnerByIndex",
    args: address && balance && Number(balance) > 0 ? [address, BigInt(0)] : undefined,
    query: { enabled: !!balance && Number(balance) > 0 }
  });

  // 3. Get position details
  const { data: posData, isLoading: isPosLoading } = useReadContract({
    address: managerAddress,
    abi: POSITIONS_MANAGER_ABI,
    functionName: "positions",
    args: firstTokenId ? [firstTokenId] : undefined,
    query: { enabled: !!firstTokenId }
  });

  const positions = useMemo(() => {
    if (!posData) return [];
    
    // posData is [nonce, operator, token0, token1, fee, tickLower, tickUpper, liquidity, ...]
    const [nonce, operator, t0, t1, fee, tickL, tickU, liq] = posData as any;
    
    return [{
      tokenId: Number(firstTokenId),
      token0: t0,
      token1: t1,
      fee: Number(fee),
      tickLower: Number(tickL),
      tickUpper: Number(tickU),
      liquidity: liq,
    }];
  }, [posData, firstTokenId]);

  return {
    positions,
    balance: balance ? Number(balance) : 0,
    isLoading: isBalanceLoading || isTokenIdLoading || isPosLoading,
  };
}
