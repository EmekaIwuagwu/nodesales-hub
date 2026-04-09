"use client";

import { useState, useEffect } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { TokenInput } from "../swap/TokenInput";
import {
  useAccount, useBalance, useReadContract,
  useWriteContract, useWaitForTransactionReceipt, useSwitchChain
} from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { parseEther, formatEther } from "viem";
import {
  KORTANA_ROUTER_ADDRESS, ROUTER_ABI,
  MDUSD_ADDRESS, ERC20_ABI,
  FACTORY_ADDRESS, FACTORY_ABI,
  WDNR_ADDRESS, PAIR_ABI
} from "@/lib/contracts";
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

  // token0 is always the DNR side; token1 is the ERC20 side
  const [token0, setToken0] = useState({ symbol: "DNR", address: WDNR_ADDRESS });
  const [token1, setToken1] = useState({ symbol: "mdUSD", address: MDUSD_ADDRESS });
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");

  const [isTokenSelectOpen, setIsTokenSelectOpen] = useState(false);
  const [selectingTarget, setSelectingTarget] = useState<0 | 1>(0);

  const isWrongNetwork = isConnected && chain?.id !== 72511;

  const { data: balance0 } = useBalance({
    address,
    token: token0.address === WDNR_ADDRESS ? undefined : token0.address as `0x${string}`
  });
  const { data: balance1 } = useBalance({ address, token: token1.address as `0x${string}` });

  // Check if pair exists on-chain
  const { data: pairAddress } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "getPair",
    args: [token0.address as `0x${string}`, token1.address as `0x${string}`],
  });

  const pairExists =
    !!pairAddress && pairAddress !== "0x0000000000000000000000000000000000000000";
  const isNewPair = pairAddress !== undefined && !pairExists;

  // Fetch reserves for existing pools
  const { data: reserves } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: PAIR_ABI,
    functionName: "getReserves",
    query: { enabled: pairExists, refetchInterval: 10000 },
  });

  // Fetch token0 of pair contract to determine reserve ordering
  const { data: pairToken0Addr } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: PAIR_ABI,
    functionName: "token0",
    query: { enabled: pairExists },
  });

  // Fetch totalSupply to calculate realistic pool share estimate
  const { data: totalSupply } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: PAIR_ABI,
    functionName: "totalSupply",
    query: { enabled: pairExists, refetchInterval: 10000 },
  });

  // Check ERC20 allowance for token1 (never needed for DNR/WDNR side)
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: token1.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address as `0x${string}`, KORTANA_ROUTER_ADDRESS as `0x${string}`],
    query: { enabled: !!address && token1.address !== WDNR_ADDRESS },
  });

  // Determine reserves in the user's token order (pair sorts by address)
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

  // When user types amount0, auto-fill amount1 from reserves
  const handleAmount0Change = (val: string) => {
    setAmount0(val);
    if (pairExists && reserve0 && reserve1 && val && parseFloat(val) > 0) {
      const r0 = parseFloat(formatEther(reserve0));
      const r1 = parseFloat(formatEther(reserve1));
      if (r0 > 0) setAmount1((parseFloat(val) * (r1 / r0)).toFixed(6));
    } else if (!pairExists) {
      // new pool — amounts are free-form, do not auto-fill
    }
  };

  // When user types amount1, auto-fill amount0 from reserves
  const handleAmount1Change = (val: string) => {
    setAmount1(val);
    if (pairExists && reserve0 && reserve1 && val && parseFloat(val) > 0) {
      const r0 = parseFloat(formatEther(reserve0));
      const r1 = parseFloat(formatEther(reserve1));
      if (r1 > 0) setAmount0((parseFloat(val) * (r0 / r1)).toFixed(6));
    }
  };

  // Price ratio display
  const priceRatio = (() => {
    if (pairExists && reserve0 && reserve1) {
      const r0 = parseFloat(formatEther(reserve0));
      const r1 = parseFloat(formatEther(reserve1));
      return r0 > 0 ? (r1 / r0).toFixed(6) : "—";
    }
    // new pool: derive from what user typed
    if (isNewPair && amount0 && amount1 && parseFloat(amount0) > 0 && parseFloat(amount1) > 0) {
      return (parseFloat(amount1) / parseFloat(amount0)).toFixed(6);
    }
    return "—";
  })();

  // Estimated pool share after deposit
  const poolShareDisplay = (() => {
    if (isNewPair) return "100.00%";
    if (!pairExists || !totalSupply || !reserve0 || !amount0 || parseFloat(amount0) <= 0)
      return "<0.01%";
    const ts = parseFloat(formatEther(totalSupply as bigint));
    const r0 = parseFloat(formatEther(reserve0));
    if (ts === 0 || r0 === 0) return "100.00%";
    // estimated LP minted = amount0 / reserve0 * totalSupply (Uniswap v2 formula)
    const lpEst = (parseFloat(amount0) / r0) * ts;
    const share = (lpEst / (ts + lpEst)) * 100;
    return share < 0.01 ? "<0.01%" : share.toFixed(2) + "%";
  })();

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      toast.success("Liquidity Provided!", { description: "Pool updated successfully." });
      setAmount0("");
      setAmount1("");
      refetchAllowance();
      onSuccess?.();
    }
  }, [isSuccess]);

  const needsApproval =
    allowance !== undefined &&
    allowance !== null &&
    amount1 !== "" &&
    parseFloat(amount1) > 0 &&
    (allowance as bigint) < parseEther(amount1);

  const canSupply =
    isConnected &&
    !isWrongNetwork &&
    amount0 !== "" &&
    amount1 !== "" &&
    parseFloat(amount0) > 0 &&
    parseFloat(amount1) > 0;

  const handleSupply = () => {
    if (!isConnected) { openConnectModal?.(); return; }
    if (isWrongNetwork) { switchChain?.({ chainId: 72511 }); return; }
    if (!canSupply) return;

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
    // 0.5 % slippage tolerance on both sides
    const amountTokenMin = (parseEther(amount1) * BigInt(995)) / BigInt(1000);
    const amountDNRMin   = (parseEther(amount0) * BigInt(995)) / BigInt(1000);

    writeContract({
      address: KORTANA_ROUTER_ADDRESS as `0x${string}`,
      abi: ROUTER_ABI,
      functionName: "addLiquidityDNR",
      args: [
        token1.address as `0x${string}`,
        parseEther(amount1),
        amountTokenMin,
        amountDNRMin,
        address as `0x${string}`,
        deadline,
      ],
      value: parseEther(amount0),
    });
  };

  const openTokenSelect = (idx: 0 | 1) => {
    setSelectingTarget(idx);
    setIsTokenSelectOpen(true);
  };

  const handleTokenSelect = (token: any) => {
    const safeToken = {
      symbol: token.symbol,
      address: token.address === "native" ? WDNR_ADDRESS : token.address,
    };
    if (selectingTarget === 0) setToken0(safeToken);
    else setToken1(safeToken);
    // reset amounts — ratio changes with new pair
    setAmount0("");
    setAmount1("");
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
          disabled={isPending || isConfirming || (isConnected && !isWrongNetwork && !canSupply)}
          className={`w-full mt-2 py-5 rounded-[28px] font-bold text-xl transition-all shadow-2xl ${
            isWrongNetwork
              ? "bg-danger text-white"
              : "bg-accent-dnr text-black shadow-[0_0_20px_rgba(245,200,66,0.3)]"
          } disabled:opacity-50`}
        >
          {!isConnected
            ? "Connect Wallet"
            : isWrongNetwork
            ? "Switch to Kortana"
            : isPending || isConfirming
            ? "Confirming..."
            : needsApproval
            ? `Approve ${token1.symbol}`
            : "Supply Liquidity"}
        </motion.button>
      </div>

      <Modal isOpen={isTokenSelectOpen} onClose={() => setIsTokenSelectOpen(false)} title="Select Token">
        <TokenSelectModal onSelect={handleTokenSelect} onClose={() => setIsTokenSelectOpen(false)} />
      </Modal>
    </>
  );
}
