// lib/hooks/useAddLiquidity.ts
"use client";

import { useAccount, useWriteContract, useChainId, useReadContract, useConfig } from "wagmi";
import { parseUnits } from "viem";
import { POSITIONS_MANAGER_ABI, ERC20_ABI } from "../constants/abis";
import { getContractAddress } from "../constants/addresses";
import { Token } from "../tokens/tokenList";
import { useState, useCallback, useMemo } from "react";

export function useAddLiquidity(token0?: Token, token1?: Token, amount0?: string, amount1?: string) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync, isPending } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const managerAddress = getContractAddress(chainId, "positionManager") as `0x${string}`;

  // Check allowances
  const { data: allowance0, refetch: refetch0 } = useReadContract({
    address: token0?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && managerAddress ? [address, managerAddress] : undefined,
    query: { enabled: !!token0 && isConnected && !!address && !!managerAddress && token0.address !== "0x0000000000000000000000000000000000000000" }
  });

  const { data: allowance1, refetch: refetch1 } = useReadContract({
    address: token1?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && managerAddress ? [address, managerAddress] : undefined,
    query: { enabled: !!token1 && isConnected && !!address && !!managerAddress && token1.address !== "0x0000000000000000000000000000000000000000" }
  });

  const needsApproval0 = useMemo(() => {
    if (!token0 || !amount0 || !isConnected || token0.address === "0x0000000000000000000000000000000000000000") return false;
    try {
        const units = parseUnits(amount0, token0.decimals);
        return (allowance0 ?? BigInt(0)) < units;
    } catch { return false; }
  }, [allowance0, token0, amount0, isConnected]);

  const needsApproval1 = useMemo(() => {
    if (!token1 || !amount1 || !isConnected || token1.address === "0x0000000000000000000000000000000000000000") return false;
    try {
        const units = parseUnits(amount1, token1.decimals);
        return (allowance1 ?? BigInt(0)) < units;
    } catch { return false; }
  }, [allowance1, token1, amount1, isConnected]);

  const approve = useCallback(async (token: Token) => {
    console.log("🚀 Starting approval with High Gas (100k) for:", token.symbol);
    if (!token || !managerAddress) return;
    setErrorMsg(null);
    try {
      const hash = await writeContractAsync({
        address: token.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [managerAddress, parseUnits("1000000000", token.decimals)],
        gas: BigInt(100000), // Manually set to bypass "Out of Gas" errors
      });
      console.log("✅ Approval TX sent:", hash);
      return hash;
    } catch (e: any) {
      console.error("❌ Approval logic error:", e);
      setErrorMsg(e.message || "Approval failed.");
      throw e;
    }
  }, [managerAddress, writeContractAsync]);

  const mint = useCallback(async (
    tickLower: number,
    tickUpper: number,
    fee: number = 3000,
    deadlineMinutes: number = 20
  ) => {
    console.log("🚀 Starting mint with High Gas (500k) for:", token0?.symbol, "/", token1?.symbol);
    if (!isConnected || !address || !token0 || !token1 || !amount0 || !amount1) return;
    setErrorMsg(null);

    try {
      const isSorted = token0.address.toLowerCase() < token1.address.toLowerCase();
      const t0 = isSorted ? token0 : token1;
      const t1 = isSorted ? token1 : token0;
      const a0 = isSorted ? amount0 : amount1;
      const a1 = isSorted ? amount1 : amount0;

      const hash = await writeContractAsync({
        address: managerAddress,
        abi: POSITIONS_MANAGER_ABI,
        functionName: "mint",
        args: [
          {
            token0: t0.address,
            token1: t1.address,
            fee,
            tickLower,
            tickUpper,
            amount0Desired: parseUnits(a0, t0.decimals),
            amount1Desired: parseUnits(a1, t1.decimals),
            amount0Min: BigInt(0),
            amount1Min: BigInt(0),
            recipient: address,
            deadline: BigInt(Math.floor(Date.now() / 1000) + deadlineMinutes * 60),
          }
        ],
        gas: BigInt(800000), // Manually set higher for minting complex V3 positions
      });

      console.log("✅ Mint TX sent:", hash);
      setTxHash(hash);
      return hash;
    } catch (e: any) {
      console.error("❌ Mint logic error:", e);
      setErrorMsg(e.message || "Mint failed.");
      throw e;
    }
  }, [isConnected, address, token0, token1, amount0, amount1, managerAddress, writeContractAsync]);

  return {
    mint,
    approve,
    needsApproval0,
    needsApproval1,
    refetch0,
    refetch1,
    isPending,
    txHash,
    errorMsg
  };
}
