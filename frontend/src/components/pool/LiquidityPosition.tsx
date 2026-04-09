"use client";

import { useAccount, useReadContract } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI, WDNR_ADDRESS, MDUSD_ADDRESS, PAIR_ABI } from "@/lib/contracts";
import { formatEther } from "viem";
import { motion } from "framer-motion";

interface LiquidityPositionProps {
  onRemove: () => void;
}

export function LiquidityPosition({ onRemove }: LiquidityPositionProps) {
  const { address } = useAccount();

  const { data: pairAddress } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPair",
    args: [WDNR_ADDRESS as `0x${string}`, MDUSD_ADDRESS as `0x${string}`],
  });

  const { data: lpBalance } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: PAIR_ABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: { enabled: !!pairAddress && !!address, refetchInterval: 15000 },
  });

  const { data: totalSupply } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: PAIR_ABI,
    functionName: "totalSupply",
    query: { enabled: !!pairAddress, refetchInterval: 15000 },
  });

  if (!lpBalance || (lpBalance as bigint) === BigInt(0)) return null;

  const lpFormatted = parseFloat(formatEther(lpBalance as bigint));

  const poolShare = (() => {
    if (!totalSupply || (totalSupply as bigint) === BigInt(0)) return "—";
    const ts = parseFloat(formatEther(totalSupply as bigint));
    const share = (lpFormatted / ts) * 100;
    return share < 0.0001 ? "<0.0001%" : share.toFixed(4) + "%";
  })();

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-bg-card/60 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-10 h-10 rounded-full bg-accent-dnr border-2 border-bg-card flex items-center justify-center text-black font-bold text-xs ring-4 ring-accent-dnr/10 shadow-[0_0_15px_rgba(245,200,66,0.2)]">K</div>
            <div className="w-10 h-10 rounded-full bg-accent-mdusd border-2 border-bg-card flex items-center justify-center text-white font-bold text-xs ring-4 ring-accent-mdusd/10 shadow-[0_0_15px_rgba(33,209,160,0.2)]">$</div>
          </div>
          <div>
            <h4 className="font-semibold text-lg">DNR / mdUSD</h4>
            <span className="text-text-secondary text-xs uppercase tracking-wider font-medium">Standard Pool</span>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="text-accent-dnr hover:bg-accent-dnr/10 px-4 py-2 rounded-xl transition-all font-semibold"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black/20 rounded-2xl p-4 border border-white/5 group hover:border-white/10 transition-colors">
          <p className="text-text-secondary text-xs mb-1 font-medium">Your Pool Share</p>
          <p className="text-xl font-space font-bold text-white group-hover:text-accent-dnr transition-colors">
            ~ {poolShare}
          </p>
        </div>
        <div className="bg-black/20 rounded-2xl p-4 border border-white/5 group hover:border-white/10 transition-colors">
          <p className="text-text-secondary text-xs mb-1 font-medium">LP Tokens</p>
          <p className="text-xl font-space font-bold text-white group-hover:text-accent-dnr transition-colors">
            {lpFormatted.toFixed(6)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
