"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { AddLiquidity } from "@/components/pool/AddLiquidity";
import { LiquidityPosition } from "@/components/pool/LiquidityPosition";
import { RemoveLiquidity } from "@/components/pool/RemoveLiquidity";
import { useAccount, useReadContract } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI, WDNR_ADDRESS, MDUSD_ADDRESS, PAIR_ABI } from "@/lib/contracts";

export default function PoolPage() {
  const { address } = useAccount();
  const [isAddLiquidityModalOpen, setIsAddLiquidityModalOpen] = useState(false);
  const [isRemoveLiquidityModalOpen, setIsRemoveLiquidityModalOpen] = useState(false);

  // Find Pair Address
  const { data: pairAddress, refetch: refetchPair } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPair",
    args: [WDNR_ADDRESS as `0x${string}`, MDUSD_ADDRESS as `0x${string}`],
  });

  // Check LP Balance
  const { data: lpBalance, refetch: refetchLpBalance } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: PAIR_ABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: { enabled: !!pairAddress && !!address }
  });

  const hasLiquidity = lpBalance && (lpBalance as bigint) > BigInt(0);

  // Called by AddLiquidity after a successful on-chain transaction so the
  // pool page immediately reflects the new position without waiting for a
  // page refresh.
  const handleLiquiditySuccess = useCallback(async () => {
    await refetchPair();
    await refetchLpBalance();
    setIsAddLiquidityModalOpen(false);
  }, [refetchPair, refetchLpBalance]);

  return (
    <>
      <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto min-h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h1 className="text-4xl font-space font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Liquidity</h1>
            <p className="text-text-secondary mt-1 font-medium">Provide liquidity to the Kortana engine to earn trading fees</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddLiquidityModalOpen(true)}
            className="flex items-center gap-2 bg-accent-dnr text-black px-6 py-3 rounded-2xl font-bold hover:shadow-[0_0_25px_rgba(245,200,66,0.3)] transition-all"
          >
            <Plus size={20} />
            New Position
          </motion.button>
        </div>

        <div className="flex flex-col gap-4">
          {hasLiquidity ? (
            <LiquidityPosition onRemove={() => setIsRemoveLiquidityModalOpen(true)} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bg-secondary/40 backdrop-blur-3xl border border-white/5 rounded-[32px] p-12 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-dnr/10 rounded-full blur-[100px] -z-10" />
              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 text-text-tertiary border border-white/10 shadow-inner">
                  <Plus size={40} className="text-white/20" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Your positions will appear here</h3>
                <p className="text-text-secondary max-w-xs mb-8 font-medium">
                  Connect your wallet to see your active liquidity positions and earnings.
                </p>
                <button
                  onClick={() => setIsAddLiquidityModalOpen(true)}
                  className="bg-white/10 hover:bg-white/20 px-8 py-4 rounded-2xl font-bold transition-all border border-white/5 active:scale-95"
                >
                  Add Liquidity
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isAddLiquidityModalOpen && (
          <Modal
            isOpen={isAddLiquidityModalOpen}
            onClose={() => setIsAddLiquidityModalOpen(false)}
            title="Add Liquidity"
          >
            <AddLiquidity onSuccess={handleLiquiditySuccess} />
          </Modal>
        )}

        {isRemoveLiquidityModalOpen && (
          <Modal
            isOpen={isRemoveLiquidityModalOpen}
            onClose={() => setIsRemoveLiquidityModalOpen(false)}
            title="Remove Liquidity"
          >
            <RemoveLiquidity />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
