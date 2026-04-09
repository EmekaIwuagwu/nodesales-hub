"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  useAccount, useReadContract,
  useWalletClient, useWaitForTransactionReceipt, useSwitchChain,
} from "wagmi";
import { DEX_ADDRESS, DEX_ABI } from "@/lib/contracts";
import { parseEther, formatEther, encodeFunctionData } from "viem";
import { toast } from "sonner";

export function RemoveLiquidity() {
  const { address, chain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const [percent, setPercent] = useState(50);
  const [isSending, setIsSending] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const isWrongNetwork = isConnected && chain?.id !== 72511;

  const { data: lpBalance, refetch: refetchLP } = useReadContract({
    address: DEX_ADDRESS as `0x${string}`,
    abi: DEX_ABI,
    functionName: "lpBalanceOf",
    args: [address as `0x${string}`],
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  const { isLoading: isConfirming, isSuccess, isError: isTxError } =
    useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (!isSuccess || !txHash) return;
    toast.success("Liquidity removed!", { description: "Tokens returned to your wallet." });
    setTxHash(undefined);
    refetchLP();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, txHash]);

  useEffect(() => {
    if (!isTxError || !txHash) return;
    toast.error("Remove liquidity reverted", { description: "Transaction was mined but failed." });
    setTxHash(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTxError, txHash]);

  const amountToRemove = lpBalance
    ? ((lpBalance as bigint) * BigInt(percent)) / 100n
    : 0n;

  const handleRemove = async () => {
    if (!walletClient || !address || amountToRemove === 0n) return;
    if (isWrongNetwork) { switchChain?.({ chainId: 72511 }); return; }

    setIsSending(true);
    try {
      const data = encodeFunctionData({
        abi: DEX_ABI,
        functionName: "removeLiquidity",
        args: [amountToRemove, 0n, 0n, address as `0x${string}`],
      });

      console.log("--- removeLiquidity ---");
      console.log("lpAmount:", formatEther(amountToRemove));

      const hash = await walletClient.sendTransaction({
        to: DEX_ADDRESS as `0x${string}`,
        data,
        value: 0n,
        gas: 500000n,
        chain,
        type: "legacy",
      });

      console.log("tx hash:", hash);
      setTxHash(hash);
      toast.success("Transaction submitted", { description: "Waiting for confirmation…" });
    } catch (e: any) {
      const msg: string = e?.message ?? "Unknown error";
      console.error("removeLiquidity error:", e);
      if (!msg.toLowerCase().includes("user rejected") && !msg.toLowerCase().includes("denied")) {
        toast.error("Remove failed", { description: msg.slice(0, 200) });
      }
    } finally {
      setIsSending(false);
    }
  };

  const isBusy = isSending || isConfirming;

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
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${percent === p ? "bg-accent-dnr text-black" : "bg-white/5 text-text-secondary hover:bg-white/10"}`}
              >
                {p === 100 ? "MAX" : p + "%"}
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
          <span className="text-text-secondary">LP tokens to burn</span>
          <span className="text-white font-medium">
            {lpBalance ? parseFloat(formatEther(amountToRemove)).toFixed(6) : "0.000000"} KLP
          </span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        disabled={isBusy || !lpBalance || amountToRemove === 0n}
        onClick={handleRemove}
        className="w-full py-4 rounded-2xl font-bold text-lg bg-white/10 text-white hover:bg-white/20 transition-all border border-white/5 disabled:opacity-50"
      >
        {isSending ? "Confirm in wallet…" : isConfirming ? "Confirming…" : "Remove Liquidity"}
      </motion.button>
    </div>
  );
}
