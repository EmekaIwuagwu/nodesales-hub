"use client";

import { useState, useEffect } from "react";
import { ArrowDown, Settings, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TokenInput } from "./TokenInput";
import {
  useAccount, useBalance, useReadContract, usePublicClient,
  useWalletClient, useWaitForTransactionReceipt, useSwitchChain
} from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { parseEther, formatEther, encodeFunctionData } from "viem";
import { DEX_ADDRESS, DEX_ABI } from "@/lib/contracts";
import { toast } from "sonner";
import { Modal } from "../ui/Modal";
import { TokenSelectModal } from "../modals/TokenSelectModal";
import { SettingsModal } from "../modals/SettingsModal";

export function SwapCard() {
  const { isConnected, address, chain } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // false = DNR → mdUSD, true = mdUSD → DNR
  const [dnrToMdusd, setDnrToMdusd] = useState(true);
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount,  setBuyAmount]  = useState("");
  const [slippage,   setSlippage]   = useState(0.5);

  const [isTokenSelectOpen, setIsTokenSelectOpen] = useState(false);
  const [isSettingsOpen,    setIsSettingsOpen]    = useState(false);

  const [txHash,     setTxHash]     = useState<`0x${string}` | undefined>();
  const [isSending,  setIsSending]  = useState(false);

  const isWrongNetwork = isConnected && chain?.id !== 72511;

  // ── Balances ─────────────────────────────────────────────────────────────────
  const { data: dnrBalance } = useBalance({ address });

  const { data: mdUSDBalance } = useReadContract({
    address: DEX_ADDRESS as `0x${string}`,
    abi: DEX_ABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: { enabled: !!address, refetchInterval: 10000 },
  });
  const mdUSDFmt = mdUSDBalance
    ? parseFloat(formatEther(mdUSDBalance as bigint)).toFixed(4)
    : "0.0000";

  // ── Price quote ───────────────────────────────────────────────────────────────
  const parsedSell = sellAmount && !isNaN(parseFloat(sellAmount)) ? parseFloat(sellAmount) : 0;

  useEffect(() => {
    if (parsedSell <= 0 || !publicClient) {
      setBuyAmount("");
      return;
    }
    let cancelled = false;
    publicClient.readContract({
      address: DEX_ADDRESS as `0x${string}`,
      abi: DEX_ABI,
      functionName: "getAmountOut",
      args: [parseEther(sellAmount), dnrToMdusd],
    }).then((result) => {
      if (!cancelled) setBuyAmount(formatEther(result as bigint));
    }).catch((err) => {
      console.error("getAmountOut error:", err);
      if (!cancelled) setBuyAmount("");
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellAmount, dnrToMdusd, publicClient]);

  // ── Tx watcher ────────────────────────────────────────────────────────────────
  const { isLoading: isConfirming, isSuccess, isError: isTxError } =
    useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (!isSuccess || !txHash) return;
    toast.success("Swap complete!", { description: "Your tokens have been swapped." });
    setSellAmount("");
    setBuyAmount("");
    setTxHash(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, txHash]);

  useEffect(() => {
    if (!isTxError || !txHash) return;
    toast.error("Swap reverted", { description: "Transaction was mined but failed." });
    setTxHash(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTxError, txHash]);

  // ── Swap ──────────────────────────────────────────────────────────────────────
  const handleSwap = async () => {
    if (!isConnected) { openConnectModal?.(); return; }
    if (isWrongNetwork) { switchChain?.({ chainId: 72511 }); return; }
    if (!walletClient || !address || parsedSell <= 0) return;

    setIsSending(true);
    try {
      const sellWei = parseEther(sellAmount);
      const minOut  = buyAmount
        ? (parseEther(buyAmount) * BigInt(Math.floor((1 - slippage / 100) * 1000))) / 1000n
        : 0n;

      let data: `0x${string}`;
      let value = 0n;

      if (dnrToMdusd) {
        // DNR → mdUSD
        data = encodeFunctionData({
          abi: DEX_ABI,
          functionName: "swapExactDNRForMDUSD",
          args: [minOut, address as `0x${string}`],
        });
        value = sellWei;
      } else {
        // mdUSD → DNR
        data = encodeFunctionData({
          abi: DEX_ABI,
          functionName: "swapExactMDUSDForDNR",
          args: [sellWei, minOut, address as `0x${string}`],
        });
      }

      console.log("--- swap ---");
      console.log("direction:", dnrToMdusd ? "DNR→mdUSD" : "mdUSD→DNR");
      console.log("sellAmount:", sellAmount);
      console.log("minOut:", formatEther(minOut));

      const hash = await walletClient.sendTransaction({
        to: DEX_ADDRESS as `0x${string}`,
        data,
        value,
        gas: 500000n,
        chain,
        type: "legacy",
      });

      console.log("tx hash:", hash);
      setTxHash(hash);
      toast.success("Swap submitted", { description: "Waiting for confirmation…" });
    } catch (e: any) {
      const msg: string = e?.message ?? "Unknown error";
      console.error("swap error:", e);
      if (!msg.toLowerCase().includes("user rejected") && !msg.toLowerCase().includes("denied")) {
        toast.error("Swap failed", { description: msg.slice(0, 200) });
      }
    } finally {
      setIsSending(false);
    }
  };

  const isBusy = isSending || isConfirming;
  const sellToken = dnrToMdusd
    ? { symbol: "DNR",   address: "native" }
    : { symbol: "mdUSD", address: DEX_ADDRESS };
  const buyToken  = dnrToMdusd
    ? { symbol: "mdUSD", address: DEX_ADDRESS }
    : { symbol: "DNR",   address: "native" };

  const sellBalance = dnrToMdusd
    ? (dnrBalance?.formatted ? parseFloat(dnrBalance.formatted).toFixed(4) : "0.0000")
    : mdUSDFmt;
  const buyBalance  = dnrToMdusd
    ? mdUSDFmt
    : (dnrBalance?.formatted ? parseFloat(dnrBalance.formatted).toFixed(4) : "0.0000");

  const rateLabel = (() => {
    if (!buyAmount || !sellAmount || parseFloat(sellAmount) <= 0) return `1 ${sellToken.symbol} = — ${buyToken.symbol}`;
    const rate = parseFloat(buyAmount) / parseFloat(sellAmount);
    return `1 ${sellToken.symbol} = ${rate.toFixed(4)} ${buyToken.symbol}`;
  })();

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
                  Wrong Network
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
              onSelectToken={() => {}}
              balance={sellBalance}
            />

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setDnrToMdusd(v => !v);
                  setSellAmount("");
                  setBuyAmount("");
                }}
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
              onSelectToken={() => {}}
              balance={buyBalance}
              readOnly
            />
          </div>

          <AnimatePresence>
            {sellAmount && parseFloat(sellAmount) > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 px-4 py-4 bg-white/5 rounded-3xl border border-white/5 flex flex-col gap-2"
              >
                <div className="flex justify-between text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                  <span>Rate</span>
                  <span className="text-white">{rateLabel}</span>
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
            disabled={isBusy || (isConnected && !isWrongNetwork && parsedSell <= 0)}
            onClick={handleSwap}
            className={`w-full mt-6 py-5 rounded-[28px] font-black text-xl tracking-wide transition-all shadow-2xl ${
              isWrongNetwork
                ? "bg-danger text-white hover:bg-danger/90"
                : "bg-accent-dnr text-black hover:bg-accent-dnr/90 shadow-[0_0_30px_rgba(245,200,66,0.3)]"
            } disabled:opacity-50`}
          >
            {!isConnected ? "Connect Wallet"
              : isWrongNetwork   ? "Switch to Kortana"
              : isSending        ? "Confirm in wallet…"
              : isConfirming     ? "Confirming…"
              : "Swap Tokens"}
          </motion.button>
        </div>
      </div>

      <Modal isOpen={isTokenSelectOpen} onClose={() => setIsTokenSelectOpen(false)} title="Select Token">
        <TokenSelectModal onSelect={() => setIsTokenSelectOpen(false)} onClose={() => setIsTokenSelectOpen(false)} />
      </Modal>
      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Transaction Settings">
        <SettingsModal slippage={slippage} setSlippage={setSlippage} onClose={() => setIsSettingsOpen(false)} />
      </Modal>
    </>
  );
}
