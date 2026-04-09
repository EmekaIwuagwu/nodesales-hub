"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { KORTANA_ROUTER_ADDRESS, ROUTER_ABI, MDUSD_ADDRESS, FACTORY_ADDRESS, FACTORY_ABI, WDNR_ADDRESS, PAIR_ABI } from "@/lib/contracts";
import { parseEther, formatEther } from "viem";
import { toast } from "sonner";

export function RemoveLiquidity() {
  const { address } = useAccount();
  const [percent, setPercent] = useState(50);

  // Find Pair Address
  const { data: pairAddress } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPair",
    args: [WDNR_ADDRESS as `0x${string}`, MDUSD_ADDRESS as `0x${string}`],
  });

  // Check LP Balance
  const { data: lpBalance } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: PAIR_ABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: { enabled: !!pairAddress && !!address }
  });

  // Check Allowance for Router to spend LP
  const { data: allowance } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: PAIR_ABI,
    functionName: "allowance",
    args: [address as `0x${string}`, KORTANA_ROUTER_ADDRESS as `0x${string}`],
    query: { enabled: !!pairAddress && !!address }
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const amountToRemove = lpBalance ? ((lpBalance as any) * BigInt(percent)) / BigInt(100) : BigInt(0);
  const needsApproval = allowance !== undefined && allowance !== null && (amountToRemove as any) > (allowance as any);

  useEffect(() => {
    if (hash) {
      toast.success("Transaction Submitted", {
        description: "Removing liquidity from the pool...",
      });
    }
  }, [hash]);

  const handleRemove = async () => {
    if (needsApproval) {
      writeContract({
        address: pairAddress as `0x${string}`,
        abi: PAIR_ABI,
        functionName: "approve",
        args: [KORTANA_ROUTER_ADDRESS as `0x${string}`, amountToRemove],
        gas: 200000n,
      });
      return;
    }

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);
    writeContract({
      address: KORTANA_ROUTER_ADDRESS as `0x${string}`,
      abi: ROUTER_ABI,
      functionName: "removeLiquidityDNR",
      args: [
        MDUSD_ADDRESS as `0x${string}`,
        amountToRemove,
        BigInt(0), // amountTokenMin
        BigInt(0), // amountDNRMin
        address as `0x${string}`,
        deadline
      ],
      gas: 500000n,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-black/20 rounded-[24px] p-6 border border-white/5 shadow-inner">
        <div className="flex justify-between items-center mb-6">
            <span className="text-4xl font-space font-bold text-white">{percent}%</span>
            <div className="flex gap-2">
                {[25, 50, 75, 100].map(p => (
                    <button
                        key={p}
                        onClick={() => setPercent(p)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${percent === p ? 'bg-accent-dnr text-black' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}
                    >
                        {p === 100 ? 'MAX' : p + '%'}
                    </button>
                ))}
            </div>
        </div>
        <input 
          type="range" 
          min="1" 
          max="100" 
          value={percent} 
          onChange={(e) => setPercent(parseInt(e.target.value))}
          className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-accent-dnr"
        />
      </div>

      <div className="flex flex-col gap-2 px-2">
        <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Amount to remove</span>
            <span className="text-white font-medium">{lpBalance ? parseFloat(formatEther(amountToRemove)).toFixed(6) : "0.0"} LP Tokens</span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        disabled={isPending || isConfirming || !lpBalance}
        onClick={handleRemove}
        className="w-full py-4 rounded-2xl font-bold text-lg bg-white/10 text-white hover:bg-white/20 transition-all border border-white/5 disabled:opacity-50"
      >
        {isPending || isConfirming ? "Processing..." : needsApproval ? "Approve LP Tokens" : "Remove Liquidity"}
      </motion.button>
    </div>
  );
}
