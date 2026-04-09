"use client";

import { useState, useEffect } from "react";
import { Plus, Settings, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TokenInput } from "../swap/TokenInput";
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { parseEther, formatEther } from "viem";
import { KORTANA_ROUTER_ADDRESS, ROUTER_ABI, MDUSD_ADDRESS, ERC20_ABI, FACTORY_ADDRESS, FACTORY_ABI, WDNR_ADDRESS } from "@/lib/contracts";
import { toast } from "sonner";
import { Modal } from "../ui/Modal";
import { TokenSelectModal } from "../modals/TokenSelectModal";

export function AddLiquidity() {
  const { isConnected, address, chain } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchChain } = useSwitchChain();
  
  const [token0, setToken0] = useState({ symbol: "DNR", address: WDNR_ADDRESS });
  const [token1, setToken1] = useState({ symbol: "mdUSD", address: MDUSD_ADDRESS });
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");
  
  const [isTokenSelectOpen, setIsTokenSelectOpen] = useState(false);
  const [selectingTarget, setSelectingTarget] = useState<0 | 1>(0);

  const isWrongNetwork = isConnected && chain?.id !== 72511;

  const { data: balance0 } = useBalance({ address, token: token0.address === WDNR_ADDRESS ? undefined : token0.address as `0x${string}` });
  const { data: balance1 } = useBalance({ address, token: token1.address as `0x${string}` });

  // Check if pair exists
  const { data: pairAddress } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPair",
    args: [token0.address as `0x${string}`, token1.address as `0x${string}`],
  });

  const isNewPair = pairAddress === "0x0000000000000000000000000000000000000000";

  // Check allowance for token1 (if not DNR)
  const { data: allowance } = useReadContract({
    address: token1.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address as `0x${string}`, KORTANA_ROUTER_ADDRESS as `0x${string}`],
    query: { enabled: !!address && token1.address !== WDNR_ADDRESS }
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      toast.success("Liquidity Provided!", { description: "Pool updated successfully." });
      setAmount0("");
      setAmount1("");
    }
  }, [isSuccess]);

  const needsApproval = allowance !== undefined && allowance !== null && amount1 !== "" && (allowance as bigint) < parseEther(amount1);

  const handleSupply = () => {
    if (!isConnected) { openConnectModal?.(); return; }
    if (isWrongNetwork) { switchChain?.({ chainId: 72511 }); return; }

    if (needsApproval) {
      writeContract({
        address: token1.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [KORTANA_ROUTER_ADDRESS as `0x${string}`, parseEther(amount1)],
      });
      return;
    }

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);
    writeContract({
      address: KORTANA_ROUTER_ADDRESS as `0x${string}`,
      abi: ROUTER_ABI,
      functionName: "addLiquidityDNR",
      args: [
        token1.address as `0x${string}`,
        parseEther(amount1),
        BigInt(0),
        BigInt(0),
        address as `0x${string}`,
        deadline
      ],
      value: parseEther(amount0)
    });
  };

  const openTokenSelect = (idx: 0 | 1) => {
    setSelectingTarget(idx);
    setIsTokenSelectOpen(true);
  };

  const handleTokenSelect = (token: any) => {
    const safeToken = { symbol: token.symbol, address: token.address === 'native' ? WDNR_ADDRESS : token.address };
    if (selectingTarget === 0) setToken0(safeToken);
    else setToken1(safeToken);
    setIsTokenSelectOpen(false);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 relative">
          <TokenInput
            label="Deposit"
            token={token0}
            amount={amount0}
            onAmountChange={setAmount0}
            onSelectToken={() => openTokenSelect(0)}
            balance={balance0?.formatted ? parseFloat(balance0.formatted).toFixed(4) : "0.00"}
          />

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none">
            <div className="bg-bg-secondary border-[6px] border-bg-card w-12 h-12 rounded-2xl flex items-center justify-center text-accent-dnr shadow-xl">
              <Plus size={24} strokeWidth={3} />
            </div>
          </div>

          <TokenInput
            label="Deposit"
            token={token1}
            amount={amount1}
            onAmountChange={setAmount1}
            onSelectToken={() => openTokenSelect(1)}
            balance={balance1?.formatted ? parseFloat(balance1.formatted).toFixed(4) : "0.00"}
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4 text-sm mt-2">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-white uppercase tracking-widest text-xs opacity-60">Pool Details</h4>
            {isNewPair && (
                <div className="bg-accent-mdusd/20 text-accent-mdusd text-[10px] font-bold px-2 py-1 rounded-md border border-accent-mdusd/30">
                    NEW POOL
                </div>
            )}
          </div>
          
          <div className="flex justify-between items-center bg-black/40 p-5 rounded-2xl border border-white/5 shadow-inner">
            <div className="flex flex-col items-center flex-1 border-r border-white/10">
              <span className="font-space font-bold text-xl text-white">1.00</span>
              <span className="text-text-tertiary text-[10px] font-bold uppercase tracking-tighter">{token0.symbol} per {token1.symbol}</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <span className="font-space font-bold text-xl text-white">&lt;0.01%</span>
              <span className="text-text-tertiary text-[10px] font-bold uppercase tracking-tighter">Share of Pool</span>
            </div>
          </div>

          {isNewPair && (
              <div className="flex items-start gap-3 p-3 bg-accent-dnr/10 border border-accent-dnr/20 rounded-xl">
                  <AlertTriangle size={16} className="text-accent-dnr mt-0.5 shrink-0" />
                  <p className="text-xs text-text-secondary leading-tight">
                    You are the first liquidity provider for this pool. The ratio you provide will set the initial market price.
                  </p>
              </div>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSupply}
          disabled={isPending || isConfirming}
          className={`w-full mt-2 py-5 rounded-[28px] font-bold text-xl transition-all shadow-2xl ${
              isWrongNetwork ? "bg-danger text-white" : "bg-accent-dnr text-black shadow-[0_0_20px_rgba(245,200,66,0.3)]"
          } disabled:opacity-50`}
        >
          {!isConnected ? "Connect Wallet" : isWrongNetwork ? "Switch to Kortana" : isPending || isConfirming ? "Confirming..." : needsApproval ? `Approve ${token1.symbol}` : "Supply Liquidity"}
        </motion.button>
      </div>

      <Modal isOpen={isTokenSelectOpen} onClose={() => setIsTokenSelectOpen(false)} title="Select Token">
        <TokenSelectModal onSelect={handleTokenSelect} onClose={() => setIsTokenSelectOpen(false)} />
      </Modal>
    </>
  );
}
