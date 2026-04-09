"use client";

import { useState, useEffect } from "react";
import { Plus, Droplets } from "lucide-react";
import { motion } from "framer-motion";
import { TokenInput } from "../swap/TokenInput";
import {
  useAccount, useBalance, useReadContract,
  useWalletClient, useWaitForTransactionReceipt, useSwitchChain
} from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { parseEther, formatEther, encodeFunctionData } from "viem";
import { DEX_ADDRESS, DEX_ABI } from "@/lib/contracts";
import { IS_FAUCET_ENABLED } from "@/lib/config";
import { toast } from "sonner";
import { Modal } from "../ui/Modal";
import { TokenSelectModal } from "../modals/TokenSelectModal";

interface AddLiquidityProps {
  onSuccess?: () => void;
}

export function AddLiquidity({ onSuccess }: AddLiquidityProps) {
  const { isConnected, address, chain } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  const [amountDNR,  setAmountDNR]  = useState("");
  const [amountMDUSD, setAmountMDUSD] = useState("");

  const [isSending,   setIsSending]   = useState(false);
  const [isFauceting, setIsFauceting] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const [isTokenSelectOpen, setIsTokenSelectOpen] = useState(false);

  const isWrongNetwork = isConnected && chain?.id !== 72511;

  // ── Balances ─────────────────────────────────────────────────────────────────
  const { data: dnrBalance } = useBalance({ address });

  const { data: mdUSDBalance, refetch: refetchMDUSD } = useReadContract({
    address: DEX_ADDRESS as `0x${string}`,
    abi: DEX_ABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  const mdUSDBalanceFmt = mdUSDBalance
    ? parseFloat(formatEther(mdUSDBalance as bigint)).toFixed(4)
    : "0.0000";
  const mdUSDBalanceZero = !mdUSDBalance || (mdUSDBalance as bigint) === 0n;

  // ── Pool state ────────────────────────────────────────────────────────────────
  const { data: reservesData, refetch: refetchReserves } = useReadContract({
    address: DEX_ADDRESS as `0x${string}`,
    abi: DEX_ABI,
    functionName: "getReserves",
    query: { refetchInterval: 10000 },
  });

  const [rMDUSD, rDNR] = reservesData
    ? [
        parseFloat(formatEther((reservesData as [bigint, bigint])[0])),
        parseFloat(formatEther((reservesData as [bigint, bigint])[1])),
      ]
    : [0, 0];

  const hasReserves = rMDUSD > 0 && rDNR > 0;
  const priceRatio  = hasReserves ? (rMDUSD / rDNR).toFixed(6) : "—";

  const { data: lpSupplyData } = useReadContract({
    address: DEX_ADDRESS as `0x${string}`,
    abi: DEX_ABI,
    functionName: "lpTotalSupply",
    query: { refetchInterval: 10000 },
  });
  const lpSupply = lpSupplyData ? parseFloat(formatEther(lpSupplyData as bigint)) : 0;

  // ── Amount handlers ───────────────────────────────────────────────────────────
  const handleDNRChange = (val: string) => {
    setAmountDNR(val);
    if (hasReserves && val && parseFloat(val) > 0) {
      setAmountMDUSD((parseFloat(val) * (rMDUSD / rDNR)).toFixed(6));
    }
  };
  const handleMDUSDChange = (val: string) => {
    setAmountMDUSD(val);
    if (hasReserves && val && parseFloat(val) > 0) {
      setAmountDNR((parseFloat(val) * (rDNR / rMDUSD)).toFixed(6));
    }
  };

  // ── Pool share estimate ───────────────────────────────────────────────────────
  const poolShareDisplay = (() => {
    const dnr = parseFloat(amountDNR  || "0");
    const md  = parseFloat(amountMDUSD || "0");
    if (!dnr || !md) return "—";
    if (!hasReserves) return "100.00%";
    // Estimate new LP tokens: proportional to DNR contribution
    const lpEstimate = (dnr / rDNR) * lpSupply;
    const share = (lpEstimate / (lpSupply + lpEstimate)) * 100;
    return share < 0.01 ? "<0.01%" : share.toFixed(2) + "%";
  })();

  // ── Transaction receipt watcher ───────────────────────────────────────────────
  const { isLoading: isConfirming, isSuccess, isError: isTxError } =
    useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (!isSuccess || !txHash) return;
    toast.success("Liquidity Added!", {
      description: "Your LP position has been created.",
    });
    setAmountDNR("");
    setAmountMDUSD("");
    setTxHash(undefined);
    refetchReserves();
    setTimeout(() => refetchMDUSD(), 3000);
    onSuccess?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, txHash]);

  useEffect(() => {
    if (!isTxError || !txHash) return;
    console.error("Supply tx reverted, hash:", txHash);
    toast.error("Supply reverted", {
      description: "Transaction was mined but reverted. Check console for details.",
    });
    setTxHash(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTxError, txHash]);

  // ── Supply Liquidity ──────────────────────────────────────────────────────────
  const handleSupply = async () => {
    if (!isConnected) { openConnectModal?.(); return; }
    if (isWrongNetwork) { switchChain?.({ chainId: 72511 }); return; }
    if (!walletClient || !address) return;

    const dnr   = parseFloat(amountDNR   || "0");
    const mdusd = parseFloat(amountMDUSD || "0");
    if (dnr <= 0 || mdusd <= 0) return;

    setIsSending(true);
    try {
      const amountMDUSDWei = parseEther(amountMDUSD);
      const amountDNRWei   = parseEther(amountDNR);
      const minMDUSD       = (amountMDUSDWei * 990n) / 1000n; // 1% slippage
      const minDNR         = (amountDNRWei   * 990n) / 1000n;

      const data = encodeFunctionData({
        abi: DEX_ABI,
        functionName: "addLiquidity",
        args: [amountMDUSDWei, minMDUSD, minDNR, address as `0x${string}`],
      });

      console.log("--- addLiquidity ---");
      console.log("DEX:", DEX_ADDRESS);
      console.log("amountMDUSD:", formatEther(amountMDUSDWei));
      console.log("amountDNR (value):", formatEther(amountDNRWei));

      const hash = await walletClient.sendTransaction({
        to: DEX_ADDRESS as `0x${string}`,
        data,
        value: amountDNRWei,
        gas: 500000n,
        chain,
        type: "legacy",
      });

      console.log("tx hash:", hash);
      setTxHash(hash);
      toast.success("Transaction submitted", { description: "Waiting for confirmation…" });
    } catch (e: any) {
      const msg: string = e?.message ?? "Unknown error";
      console.error("addLiquidity error:", e);
      if (!msg.toLowerCase().includes("user rejected") && !msg.toLowerCase().includes("denied")) {
        toast.error("Supply failed", { description: msg.slice(0, 200) });
      }
    } finally {
      setIsSending(false);
    }
  };

  // ── Faucet ────────────────────────────────────────────────────────────────────
  const handleFaucet = async () => {
    if (!address) return;
    setIsFauceting(true);
    try {
      const res  = await fetch("/api/faucet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Faucet failed");
      toast.success("10,000 mdUSD sent!", {
        description: `Tx: ${(json.hash as string).slice(0, 18)}…`,
      });
      setTimeout(() => refetchMDUSD(), 4000);
      setTimeout(() => refetchMDUSD(), 9000);
    } catch (err: unknown) {
      toast.error("Faucet failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsFauceting(false);
    }
  };

  // ── Derived state ─────────────────────────────────────────────────────────────
  const isBusy       = isSending || isConfirming;
  const canSupply    = isConnected && !isWrongNetwork &&
                       parseFloat(amountDNR || "0") > 0 &&
                       parseFloat(amountMDUSD || "0") > 0;

  const buttonLabel = (() => {
    if (!isConnected)           return "Connect Wallet";
    if (isWrongNetwork)         return "Switch to Kortana";
    if (isSending)              return "Confirm in wallet…";
    if (isConfirming)           return "Confirming…";
    return "Supply Liquidity";
  })();

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Inputs */}
        <div className="flex flex-col gap-1 relative">
          <TokenInput
            label="Deposit"
            token={{ symbol: "DNR", address: "native" }}
            amount={amountDNR}
            onAmountChange={handleDNRChange}
            onSelectToken={() => {}}
            balance={dnrBalance?.formatted
              ? parseFloat(dnrBalance.formatted).toFixed(4)
              : "0.0000"}
          />

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none">
            <div className="bg-bg-secondary border-[6px] border-bg-card w-12 h-12 rounded-2xl flex items-center justify-center text-accent-dnr shadow-xl">
              <Plus size={24} strokeWidth={3} />
            </div>
          </div>

          <TokenInput
            label="Deposit"
            token={{ symbol: "mdUSD", address: DEX_ADDRESS }}
            amount={amountMDUSD}
            onAmountChange={handleMDUSDChange}
            onSelectToken={() => setIsTokenSelectOpen(true)}
            balance={mdUSDBalanceFmt}
          />
        </div>

        {/* Faucet banner */}
        {isConnected && mdUSDBalanceZero && IS_FAUCET_ENABLED && (
          <div className="flex items-center justify-between bg-accent-mdusd/10 border border-accent-mdusd/20 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-accent-mdusd font-medium">
              <Droplets size={16} />
              <span>You have 0 mdUSD — get test tokens</span>
            </div>
            <button
              onClick={handleFaucet}
              disabled={isFauceting}
              className="bg-accent-mdusd text-black text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isFauceting ? "Sending…" : "Get 10k mdUSD"}
            </button>
          </div>
        )}

        {/* Pool Details */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4 text-sm mt-2">
          <h4 className="font-bold text-white uppercase tracking-widest text-xs opacity-60">
            Pool Details
          </h4>

          <div className="flex justify-between items-center bg-black/40 p-5 rounded-2xl border border-white/5 shadow-inner">
            <div className="flex flex-col items-center flex-1 border-r border-white/10">
              <span className="font-space font-bold text-xl text-white">{priceRatio}</span>
              <span className="text-text-tertiary text-[10px] font-bold uppercase tracking-tighter">
                mdUSD per DNR
              </span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <span className="font-space font-bold text-xl text-white">{poolShareDisplay}</span>
              <span className="text-text-tertiary text-[10px] font-bold uppercase tracking-tighter">
                Share of Pool
              </span>
            </div>
          </div>
        </div>

        {/* Supply button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSupply}
          disabled={isBusy || (isConnected && !isWrongNetwork && !canSupply)}
          className={`w-full mt-2 py-5 rounded-[28px] font-bold text-xl transition-all shadow-2xl ${
            isWrongNetwork
              ? "bg-danger text-white"
              : "bg-accent-dnr text-black shadow-[0_0_20px_rgba(245,200,66,0.3)]"
          } disabled:opacity-50`}
        >
          {buttonLabel}
        </motion.button>

        <div className="text-[10px] text-center opacity-30 font-mono mt-2">
          v2.0 | DEX: {DEX_ADDRESS.slice(0, 6)}…
        </div>
      </div>

      <Modal isOpen={isTokenSelectOpen} onClose={() => setIsTokenSelectOpen(false)} title="Select Token">
        <TokenSelectModal onSelect={() => setIsTokenSelectOpen(false)} onClose={() => setIsTokenSelectOpen(false)} />
      </Modal>
    </>
  );
}
