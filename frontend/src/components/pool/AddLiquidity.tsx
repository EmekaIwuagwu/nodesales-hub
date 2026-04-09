"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, AlertTriangle, Droplets } from "lucide-react";
import { motion } from "framer-motion";
import { TokenInput } from "../swap/TokenInput";
import {
  useAccount, useBalance, useReadContract,
  useWalletClient, usePublicClient,
  useWaitForTransactionReceipt, useSwitchChain
} from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { parseEther, formatEther, encodeFunctionData } from "viem";
import {
  KORTANA_ROUTER_ADDRESS, ROUTER_ABI,
  MDUSD_ADDRESS, ERC20_ABI,
  FACTORY_ADDRESS, FACTORY_ABI,
  WDNR_ADDRESS, PAIR_ABI
} from "@/lib/contracts";
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
  const publicClient = usePublicClient();

  const [token0, setToken0] = useState({ symbol: "DNR", address: WDNR_ADDRESS });
  const [token1, setToken1] = useState({ symbol: "mdUSD", address: MDUSD_ADDRESS });
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");

  const [isTokenSelectOpen, setIsTokenSelectOpen] = useState(false);
  const [selectingTarget, setSelectingTarget] = useState<0 | 1>(0);

  // "approve" | "supply" | null — which tx is currently in flight
  const [step, setStep] = useState<"approve" | "supply" | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isFauceting, setIsFauceting] = useState(false);

  // txHash for useWaitForTransactionReceipt
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  // Ref captures the latest amounts so the approval-success effect never reads stale values
  const amountsRef = useRef({ amount0, amount1, token1Address: token1.address });
  useEffect(() => {
    amountsRef.current = { amount0, amount1, token1Address: token1.address };
  }, [amount0, amount1, token1.address]);

  const isWrongNetwork = isConnected && chain?.id !== 72511;

  // ── Balances ────────────────────────────────────────────────────────────────
  const { data: balance0 } = useBalance({
    address,
    token: token0.address === WDNR_ADDRESS ? undefined : token0.address as `0x${string}`,
  });
  const { data: balance1, refetch: refetchBalance1 } = useBalance({
    address,
    token: token1.address as `0x${string}`,
  });
  const token1BalanceZero = !balance1 || parseFloat(balance1.formatted) === 0;

  // ── Pair state ──────────────────────────────────────────────────────────────
  const { data: pairAddress } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPair",
    args: [token0.address as `0x${string}`, token1.address as `0x${string}`],
  });

  const pairExists = !!pairAddress && pairAddress !== "0x0000000000000000000000000000000000000000";
  const isNewPair  = pairAddress !== undefined && !pairExists;

  const { data: reserves } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: PAIR_ABI,
    functionName: "getReserves",
    query: { enabled: pairExists, refetchInterval: 10000 },
  });
  const { data: pairToken0Addr } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: PAIR_ABI,
    functionName: "token0",
    query: { enabled: pairExists },
  });
  const { data: totalSupply } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: PAIR_ABI,
    functionName: "totalSupply",
    query: { enabled: pairExists, refetchInterval: 10000 },
  });

  // ── Allowance ────────────────────────────────────────────────────────────────
  const {
    data: allowanceData,
    isLoading: isAllowanceLoading,
    refetch: refetchAllowance,
  } = useReadContract({
    address: token1.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address as `0x${string}`, KORTANA_ROUTER_ADDRESS as `0x${string}`],
    query: { enabled: !!address && token1.address !== WDNR_ADDRESS },
  });

  // ── Reserve ordering ────────────────────────────────────────────────────────
  const pairToken0Lower = (pairToken0Addr as string | undefined)?.toLowerCase();
  const token0Lower = token0.address.toLowerCase();
  const reserve0 =
    reserves && pairToken0Lower !== undefined
      ? pairToken0Lower === token0Lower
        ? (reserves as [bigint, bigint, number])[0]
        : (reserves as [bigint, bigint, number])[1]
      : null;
  const reserve1 =
    reserves && pairToken0Lower !== undefined
      ? pairToken0Lower === token0Lower
        ? (reserves as [bigint, bigint, number])[1]
        : (reserves as [bigint, bigint, number])[0]
      : null;

  // ── Amount handlers ─────────────────────────────────────────────────────────
  const handleAmount0Change = (val: string) => {
    setAmount0(val);
    if (pairExists && reserve0 && reserve1 && val && parseFloat(val) > 0) {
      const r0 = parseFloat(formatEther(reserve0));
      const r1 = parseFloat(formatEther(reserve1));
      if (r0 > 0) setAmount1((parseFloat(val) * (r1 / r0)).toFixed(6));
    }
  };
  const handleAmount1Change = (val: string) => {
    setAmount1(val);
    if (pairExists && reserve0 && reserve1 && val && parseFloat(val) > 0) {
      const r0 = parseFloat(formatEther(reserve0));
      const r1 = parseFloat(formatEther(reserve1));
      if (r1 > 0) setAmount0((parseFloat(val) * (r0 / r1)).toFixed(6));
    }
  };

  // ── Display ─────────────────────────────────────────────────────────────────
  const priceRatio = (() => {
    if (pairExists && reserve0 && reserve1) {
      const r0 = parseFloat(formatEther(reserve0));
      const r1 = parseFloat(formatEther(reserve1));
      return r0 > 0 ? (r1 / r0).toFixed(6) : "—";
    }
    if (isNewPair && amount0 && amount1 && parseFloat(amount0) > 0 && parseFloat(amount1) > 0)
      return (parseFloat(amount1) / parseFloat(amount0)).toFixed(6);
    return "—";
  })();

  const poolShareDisplay = (() => {
    if (isNewPair) return "100.00%";
    if (!pairExists || !totalSupply || !reserve0 || !amount0 || parseFloat(amount0) <= 0) return "<0.01%";
    const ts = parseFloat(formatEther(totalSupply as bigint));
    const r0 = parseFloat(formatEther(reserve0));
    if (ts === 0 || r0 === 0) return "100.00%";
    const lpEst = (parseFloat(amount0) / r0) * ts;
    const share = (lpEst / (ts + lpEst)) * 100;
    return share < 0.01 ? "<0.01%" : share.toFixed(2) + "%";
  })();

  // ── Approval state ──────────────────────────────────────────────────────────
  // While loading → assume needs approval (safe default — prevents skipping approve)
  const needsApproval =
    isAllowanceLoading ||
    allowanceData === undefined ||
    (amount1 !== "" && parseFloat(amount1) > 0 && (allowanceData as bigint) < parseEther(amount1));

  const canSupply =
    isConnected &&
    !isWrongNetwork &&
    amount0 !== "" &&
    amount1 !== "" &&
    parseFloat(amount0) > 0 &&
    parseFloat(amount1) > 0;

  // ── Transaction receipt watcher ─────────────────────────────────────────────
  const { isLoading: isConfirming, isSuccess, isError: isReceiptError } =
    useWaitForTransactionReceipt({ hash: txHash });

  // Surface on-chain failure (tx mined but reverted)
  useEffect(() => {
    if (!isReceiptError || !txHash) return;
    toast.error(step === "approve" ? "Approval reverted on-chain" : "Supply reverted on-chain", {
      description: "Check that you have enough balance and the amounts are valid.",
    });
    setStep(null);
    setTxHash(undefined);
  }, [isReceiptError]);

  // After each tx confirms, move to the next step
  useEffect(() => {
    if (!isSuccess || !txHash) return;

    if (step === "approve") {
      toast.success(`${amountsRef.current.token1Address === MDUSD_ADDRESS ? "mdUSD" : "Token"} approved!`);
      refetchAllowance();
      // Immediately open the supply wallet popup — no extra click needed
      const { amount0: a0, amount1: a1 } = amountsRef.current;
      setTxHash(undefined); // reset so receipt watcher doesn't fire again
      setStep(null);
      doSupply(a0, a1);
    } else if (step === "supply") {
      toast.success("Liquidity Provided!", { description: "Your LP position has been created." });
      setAmount0("");
      setAmount1("");
      setTxHash(undefined);
      setStep(null);
      onSuccess?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, txHash]);

  // ── Raw send — skips wagmi/viem gas estimation entirely ──────────────────────
  // No simulation: just build calldata + send. Kortana's eth_call / eth_estimateGas
  // are both unreliable; we hardcode gas and let the mined receipt tell us if it failed.
  const sendRaw = async (
    to: `0x${string}`,
    data: `0x${string}`,
    value: bigint,
    gas: bigint,
  ): Promise<`0x${string}`> => {
    if (!walletClient) throw new Error("Wallet not connected");
    return walletClient.sendTransaction({ to, data, value, gas, chain });
  };

  // ── Core actions ─────────────────────────────────────────────────────────────
  const doApprove = async (a1: string, t1Address: string) => {
    setStep("approve");
    setIsSending(true);
    try {
      const hash = await sendRaw(
        t1Address as `0x${string}`,
        encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "approve",
          args: [KORTANA_ROUTER_ADDRESS as `0x${string}`, parseEther(a1)],
        }),
        0n,
        200000n,
      );
      setTxHash(hash);
      toast.success("Approval submitted", { description: "Waiting for confirmation…" });
    } catch (e: any) {
      const msg: string = e?.message ?? "Approval rejected";
      // User rejection is not an error worth toasting loudly
      if (!msg.toLowerCase().includes("user rejected") && !msg.toLowerCase().includes("denied")) {
        toast.error("Approval failed", { description: msg.slice(0, 150) });
      }
      setStep(null);
    } finally {
      setIsSending(false);
    }
  };

  const doSupply = async (a0: string, a1: string) => {
    setStep("supply");
    setIsSending(true);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);
    const amountTokenMin = (parseEther(a1) * 995n) / 1000n;
    const amountDNRMin   = (parseEther(a0) * 995n) / 1000n;
    try {
      const hash = await sendRaw(
        KORTANA_ROUTER_ADDRESS as `0x${string}`,
        encodeFunctionData({
          abi: ROUTER_ABI,
          functionName: "addLiquidityDNR",
          args: [
            amountsRef.current.token1Address as `0x${string}`,
            parseEther(a1),
            amountTokenMin,
            amountDNRMin,
            address as `0x${string}`,
            deadline,
          ],
        }),
        parseEther(a0),
        500000n,
      );
      setTxHash(hash);
      toast.success("Supply submitted", { description: "Waiting for confirmation…" });
    } catch (e: any) {
      const msg: string = e?.message ?? "Supply rejected";
      if (!msg.toLowerCase().includes("user rejected") && !msg.toLowerCase().includes("denied")) {
        toast.error("Supply failed", { description: msg.slice(0, 150) });
      }
      setStep(null);
    } finally {
      setIsSending(false);
    }
  };

  const handleSupply = async () => {
    if (!isConnected) { openConnectModal?.(); return; }
    if (isWrongNetwork) { switchChain?.({ chainId: 72511 }); return; }
    if (!canSupply) return;

    if (needsApproval) {
      await doApprove(amount1, token1.address);
    } else {
      await doSupply(amount0, amount1);
    }
  };

  // ── Faucet ───────────────────────────────────────────────────────────────────
  const handleFaucet = async () => {
    if (!address) return;
    setIsFauceting(true);
    try {
      const res = await fetch("/api/faucet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Faucet failed");
      toast.success("10,000 mdUSD sent!", { description: `Tx: ${(data.hash as string).slice(0, 18)}…` });
      setTimeout(() => refetchBalance1(), 4000);
      setTimeout(() => refetchBalance1(), 8000);
    } catch (err: unknown) {
      toast.error("Faucet failed", { description: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setIsFauceting(false);
    }
  };

  // ── Token select ─────────────────────────────────────────────────────────────
  const openTokenSelect = (idx: 0 | 1) => { setSelectingTarget(idx); setIsTokenSelectOpen(true); };
  const handleTokenSelect = (token: any) => {
    const safeToken = {
      symbol: token.symbol,
      address: token.address === "native" ? WDNR_ADDRESS : token.address,
    };
    if (selectingTarget === 0) setToken0(safeToken);
    else setToken1(safeToken);
    setAmount0("");
    setAmount1("");
    setIsTokenSelectOpen(false);
  };

  // ── Button label ─────────────────────────────────────────────────────────────
  const isBusy = isSending || isConfirming;
  const buttonLabel = (() => {
    if (!isConnected) return "Connect Wallet";
    if (isWrongNetwork) return "Switch to Kortana";
    if (isSending && step === "approve") return `Confirm approval in wallet…`;
    if (isConfirming && step === "approve") return "Confirming approval… (1/2)";
    if (isSending && step === "supply") return "Confirm supply in wallet…";
    if (isConfirming && step === "supply") return "Supplying liquidity… (2/2)";
    if (isAllowanceLoading) return "Loading…";
    if (needsApproval) return `Approve ${token1.symbol}`;
    return "Supply Liquidity";
  })();

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 relative">
          <TokenInput
            label="Deposit"
            token={token0}
            amount={amount0}
            onAmountChange={handleAmount0Change}
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
            onAmountChange={handleAmount1Change}
            onSelectToken={() => openTokenSelect(1)}
            balance={balance1?.formatted ? parseFloat(balance1.formatted).toFixed(4) : "0.00"}
          />
        </div>

        {/* Faucet banner */}
        {isConnected && token1BalanceZero && IS_FAUCET_ENABLED && (
          <div className="flex items-center justify-between bg-accent-mdusd/10 border border-accent-mdusd/20 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-accent-mdusd font-medium">
              <Droplets size={16} />
              <span>You have 0 {token1.symbol} — get test tokens</span>
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
              <span className="font-space font-bold text-xl text-white">{priceRatio}</span>
              <span className="text-text-tertiary text-[10px] font-bold uppercase tracking-tighter">
                {token1.symbol} per {token0.symbol}
              </span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <span className="font-space font-bold text-xl text-white">{poolShareDisplay}</span>
              <span className="text-text-tertiary text-[10px] font-bold uppercase tracking-tighter">Share of Pool</span>
            </div>
          </div>

          {isNewPair && (
            <div className="flex items-start gap-3 p-3 bg-accent-dnr/10 border border-accent-dnr/20 rounded-xl">
              <AlertTriangle size={16} className="text-accent-dnr mt-0.5 shrink-0" />
              <p className="text-xs text-text-secondary leading-tight">
                You are the first liquidity provider for this pool. The ratio you set here becomes the initial market price.
              </p>
            </div>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSupply}
          disabled={isBusy || (isConnected && !isWrongNetwork && !canSupply) || isAllowanceLoading}
          className={`w-full mt-2 py-5 rounded-[28px] font-bold text-xl transition-all shadow-2xl ${
            isWrongNetwork
              ? "bg-danger text-white"
              : "bg-accent-dnr text-black shadow-[0_0_20px_rgba(245,200,66,0.3)]"
          } disabled:opacity-50`}
        >
          {buttonLabel}
        </motion.button>
      </div>

      <Modal isOpen={isTokenSelectOpen} onClose={() => setIsTokenSelectOpen(false)} title="Select Token">
        <TokenSelectModal onSelect={handleTokenSelect} onClose={() => setIsTokenSelectOpen(false)} />
      </Modal>
    </>
  );
}
