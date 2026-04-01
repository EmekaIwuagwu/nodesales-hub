import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useReadContract } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { SWAP_ROUTER_ABI, ERC20_ABI } from "../constants/abis";
import { getContractAddress } from "../constants/addresses";
import { Token } from "../tokens/tokenList";
import { useState, useCallback, useMemo } from "react";

export function useSwap(tokenIn?: Token, amountIn?: string) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync, isPending: isWritePending } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const routerAddress = useMemo(() => getContractAddress(chainId, "router") as `0x${string}`, [chainId]);

  // Allowance check
  const isNativeIn = tokenIn?.address === "0x0000000000000000000000000000000000000000";
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenIn?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && routerAddress ? [address, routerAddress] : undefined,
    query: {
      enabled: isConnected && !!address && !!tokenIn && !isNativeIn && !!routerAddress,
    }
  });

  const needsApproval = useMemo(() => {
    if (!isConnected || !amountIn || isNativeIn) return false;
    try {
      const unitsIn = parseUnits(amountIn, tokenIn?.decimals || 18);
      return (allowance ?? BigInt(0)) < unitsIn;
    } catch {
      return false;
    }
  }, [isConnected, amountIn, tokenIn, allowance, isNativeIn]);

  const approve = useCallback(async () => {
    if (!tokenIn || !routerAddress) return;
    try {
      const hash = await writeContractAsync({
        address: tokenIn.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [routerAddress, parseUnits("1000000000", tokenIn.decimals)], // Infinite-ish approval
        account: address as `0x${string}`,
      } as any);
      await refetchAllowance();
      return hash;
    } catch (e) {
      console.error("Approval failed", e);
      throw e;
    }
  }, [tokenIn, routerAddress, writeContractAsync, refetchAllowance, address]);

  const swap = useCallback(async (
    tokenOut: Token,
    amountInStr: string,
    slippageTolerance: number = 0.5,
    deadlineMinutes: number = 20
  ) => {
    if (!isConnected || !address || !amountInStr || !tokenIn) return;

    const unitsIn = parseUnits(amountInStr, tokenIn.decimals);
    const amountOutMinimum = BigInt(0); 
    const deadline = BigInt(Math.floor(Date.now() / 1000) + deadlineMinutes * 60);

    try {
      const hash = await writeContractAsync({
        address: routerAddress,
        abi: SWAP_ROUTER_ABI,
        functionName: "exactInputSingle",
        args: [
          {
            tokenIn: tokenIn.address as `0x${string}`,
            tokenOut: tokenOut.address as `0x${string}`,
            fee: 3000, 
            recipient: address as `0x${string}`,
            deadline,
            amountIn: unitsIn,
            amountOutMinimum,
            sqrtPriceLimitX96: BigInt(0),
          }
        ],
        value: isNativeIn ? unitsIn : undefined,
        account: address as `0x${string}`,
      } as any);

      setTxHash(hash);
      return hash;
    } catch (error) {
      console.error("Swap failed", error);
      throw error;
    }
  }, [isConnected, address, chainId, routerAddress, tokenIn, isNativeIn, writeContractAsync]);

  return {
    swap,
    approve,
    needsApproval,
    isPending: isWritePending,
    txHash,
    allowance,
  };
}
