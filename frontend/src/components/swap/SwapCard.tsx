"use client";

import { useState, useEffect } from "react";
import { ArrowDown, Settings, Info, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TokenInput } from "./TokenInput";
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { parseEther, formatEther } from "viem";
import { KORTANA_ROUTER_ADDRESS, ROUTER_ABI, MDUSD_ADDRESS, WDNR_ADDRESS } from "@/lib/contracts";
import { toast } from "sonner";
import { Modal } from "../ui/Modal";
import { TokenSelectModal } from "../modals/TokenSelectModal";
import { SettingsModal } from "../modals/SettingsModal";

export function SwapCard() {
  const { isConnected, address, chain } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchChain } = useSwitchChain();
  
  const [sellToken, setSellToken] = useState({ symbol: "DNR", address: WDNR_ADDRESS });
  const [buyToken, setBuyToken] = useState({ symbol: "mdUSD", address: MDUSD_ADDRESS });
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [isInverted, setIsInverted] = useState(false);
  
  const [slippage, setSlippage] = useState(0.5);
  const [isTokenSelectOpen, setIsTokenSelectOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectingTarget, setSelectingTarget] = useState<"sell" | "buy">("sell");

  const isWrongNetwork = isConnected && chain?.id !== 72511;

  // Balances
  const { data: dnrBalance } = useBalance({ address });
  const { data: mdusdBalance } = useBalance({ address, token: MDUSD_ADDRESS as `0x${string}` });

  // Pricing Logic
  const path = isInverted 
    ? [MDUSD_ADDRESS as `0x${string}`, WDNR_ADDRESS as `0x${string}`]
    : [WDNR_ADDRESS as `0x${string}`, MDUSD_ADDRESS as `0x${string}`];

  const { data: amountsOut } = useReadContract({
    address: KORTANA_ROUTER_ADDRESS as `0x${string}`,
    abi: ROUTER_ABI,
    functionName: "getAmountsOut",
    args: sellAmount && !isNaN(parseFloat(sellAmount)) ? [parseEther(sellAmount), path] : undefined,
    query: {
      enabled: !!sellAmount && !isNaN(parseFloat(sellAmount)) && parseFloat(sellAmount) > 0,
      refetchInterval: 10000 
    }
  });

  useEffect(() => {
    if (amountsOut && Array.isArray(amountsOut) && amountsOut.length > 1) {
      setBuyAmount(formatEther(amountsOut[1]));
    } else {
      setBuyAmount("");
    }
  }, [amountsOut]);

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (writeError) {
      toast.error("Swap failed", { description: writeError.message?.slice(0, 120) });
    }
  }, [writeError]);

  useEffect(() => {
    if (hash) {
      toast.success("Transaction Submitted", {
        description: "Executing swap on Kortana...",
      });
    }
  }, [hash]);

  const handleSwap = () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    if (isWrongNetwork) {
      switchChain?.({ chainId: 72511 });
      return;
    }

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);
    const amountOutMin = buyAmount ? (parseEther(buyAmount) * BigInt(1000 - slippage * 10)) / 1000n : 0n;
    
    if (!isInverted) {
      writeContract({
        address: KORTANA_ROUTER_ADDRESS as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: "swapExactDNRForTokens",
        args: [amountOutMin, path, address as `0x${string}`, deadline],
        value: parseEther(sellAmount),
        gas: 1000000n,
        type: 'legacy',
      });
    } else {
      writeContract({
        address: KORTANA_ROUTER_ADDRESS as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: "swapExactTokensForDNR",
        args: [parseEther(sellAmount), amountOutMin, path, address as `0x${string}`, deadline],
        gas: 1000000n,
        type: 'legacy',
      });
    }
  };

  const openTokenSelect = (target: "sell" | "buy") => {
    setSelectingTarget(target);
    setIsTokenSelectOpen(true);
  };

  const handleTokenSelect = (token: any) => {
    const safeToken = { symbol: token.symbol, address: token.address === 'native' ? WDNR_ADDRESS : token.address };
    if (selectingTarget === "sell") setSellToken(safeToken);
    else setBuyToken(safeToken);
    setIsTokenSelectOpen(false);
  };

  return (
    <>
      <div className="w-full max-w-[500px] bg-bg-card/40 backdrop-blur-3xl border border-white/10 rounded-[40px] p-2 shadow-2xl relative group">
        <div className="p-4">
          <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-2xl font-space font-bold text-white tracking-tight">Swap</h2>
            <div className="flex gap-2">
                {isWrongNetwork && (
                    <button 
                        onClick={() => switchChain?.({ chainId: 72511 })}
                        className="bg-danger/20 text-danger border border-danger/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-pulse hover:bg-danger/30 transition-all"
                    >
                        <AlertTriangle size={14} />
                        Wrong Network (ID: {chain?.id})
                    </button>
                )}
                <motion.button 
                    whileHover={{ rotate: 90, scale: 1.1 }} 
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5"
                >
                    <Settings size={22} className="text-text-secondary" />
                </motion.button>
            </div>
          </div>

          <div className="flex flex-col gap-2 relative">
            <TokenInput
              label="Sell"
              token={sellToken}
              amount={sellAmount}
              onAmountChange={setSellAmount}
              onSelectToken={() => openTokenSelect("sell")}
              balance={sellToken.symbol === "DNR" ? (dnrBalance?.formatted ? parseFloat(dnrBalance.formatted).toFixed(4) : "0.00") : (mdusdBalance?.formatted ? parseFloat(mdusdBalance.formatted).toFixed(4) : "0.00")}
            />

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsInverted(!isInverted)}
                className="bg-bg-secondary border-8 border-bg-card w-14 h-14 rounded-2xl flex items-center justify-center text-accent-dnr hover:bg-accent-dnr hover:text-black transition-all cursor-pointer shadow-xl ring-2 ring-white/5"
              >
                <ArrowDown size={24} strokeWidth={3} />
              </motion.button>
            </div>

            <TokenInput
              label="Buy"
              token={buyToken}
              amount={buyAmount}
              onAmountChange={() => {}}
              onSelectToken={() => openTokenSelect("buy")}
              balance={buyToken.symbol === "mdUSD" ? (mdusdBalance?.formatted ? parseFloat(mdusdBalance.formatted).toFixed(4) : "0.00") : (dnrBalance?.formatted ? parseFloat(dnrBalance.formatted).toFixed(4) : "0.00")}
              readOnly
            />
          </div>

          <AnimatePresence>
            {sellAmount && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 px-4 py-4 bg-white/5 rounded-3xl border border-white/5 flex flex-col gap-2"
                >
                    <div className="flex justify-between text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                        <span>Rate</span>
                        <span className="text-white">1 {sellToken.symbol} = {buyAmount ? (parseFloat(buyAmount)/parseFloat(sellAmount)).toFixed(6) : "0.00"} {buyToken.symbol}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                        <span>Slippage</span>
                        <span className="text-accent-dnr">{slippage}%</span>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isPending || isConfirming}
            onClick={handleSwap}
            className={`w-full mt-6 py-5 rounded-[28px] font-black text-xl tracking-wide transition-all shadow-2xl ${
                isWrongNetwork 
                ? "bg-danger text-white hover:bg-danger/90" 
                : "bg-accent-dnr text-black hover:bg-accent-dnr/90 shadow-[0_0_30px_rgba(245,200,66,0.3)]"
            } disabled:opacity-50`}
          >
            {!isConnected ? "Connect Wallet" : isWrongNetwork ? "Switch to Kortana" : isPending || isConfirming ? "Confirming..." : "Swap Tokens"}
          </motion.button>
        </div>
      </div>

      <Modal isOpen={isTokenSelectOpen} onClose={() => setIsTokenSelectOpen(false)} title="Select Token">
        <TokenSelectModal onSelect={handleTokenSelect} onClose={() => setIsTokenSelectOpen(false)} />
      </Modal>

      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Transaction Settings">
        <SettingsModal slippage={slippage} setSlippage={setSlippage} onClose={() => setIsSettingsOpen(false)} />
      </Modal>
    </>
  );
}
