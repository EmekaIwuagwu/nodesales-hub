import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ethers } from "ethers";
import { useQuery }  from "@tanstack/react-query";
import axios         from "axios";
import confetti      from "canvas-confetti";
import toast         from "react-hot-toast";
import { useWallet } from "../hooks/useWallet";
import { useNodePurchase } from "../hooks/useNodePurchase";
import {
  getKortanaReadProvider,
  getProvider,
  getUSDTContract,
  formatUSDT,
  switchToKortana,
  KORTANA_NETWORK,
  KORTANA_CHAIN_ID,
} from "../utils/contracts";
import Logo from "../components/Logo";

const API      = import.meta.env.VITE_API_URL || "";
const EXPLORER = import.meta.env.VITE_EXPLORER_URL || "";

const TIER_NAMES  = ["Genesis", "Early", "Full", "Premium"];
const TIER_ICONS  = ["⚡", "🌟", "🔥", "💎"];
const TIER_CONFIG = [
  { accent: "text-blue-400",   border: "border-blue-500/40",   bg: "bg-blue-500/8",   ring: "ring-blue-500/30"   },
  { accent: "text-kortana-accent", border: "border-kortana-accent/40", bg: "bg-kortana-accent/8", ring: "ring-kortana-accent/30" },
  { accent: "text-orange-400", border: "border-orange-500/40", bg: "bg-orange-500/8", ring: "ring-orange-500/30" },
  { accent: "text-purple-400", border: "border-purple-500/40", bg: "bg-purple-500/8", ring: "ring-purple-500/30" },
];
const TIER_PERKS = [
  ["1 DNR / epoch", "Early adopter tier", "Transferable license"],
  ["2 DNR / epoch", "2× reward multiplier", "Transferable license"],
  ["5 DNR / epoch", "5× reward multiplier", "Priority support"],
  ["10 DNR / epoch", "10× reward multiplier", "Exclusive benefits"],
];
const DNR_RATES = [1, 2, 5, 10];

function Steps({ current }) {
  const steps = ["Connect", "Select Node", "Review Order", "Complete"];
  return (
    <div className="flex items-center mb-10">
      {steps.map((s, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`
                w-9 h-9 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-300
                ${done   ? "bg-kortana-accent border-kortana-accent text-kortana-950 shadow-glow-sm"
                : active ? "border-kortana-accent text-kortana-accent bg-kortana-accent/10"
                         : "border-kortana-700/60 text-gray-600 bg-kortana-800/40"}
              `}>
                {done ? "✓" : i + 1}
              </div>
              <span className={`text-xs mt-1.5 whitespace-nowrap font-semibold ${
                active ? "text-kortana-accent" : done ? "text-gray-400" : "text-gray-600"
              }`}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-3 mb-5 transition-colors ${done ? "bg-kortana-accent/50" : "bg-kortana-700/50"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Buy() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [selectedTier, setSelectedTier] = useState(parseInt(params.get("tier") || "0"));
  const [quantity,     setQuantity]     = useState(1);
  const [usdtBalance,  setUsdtBalance]  = useState(null);
  const [reviewStep,   setReviewStep]   = useState(false);
  const [fauceting,    setFauceting]    = useState(false);

  useEffect(() => {
    const ref = params.get("ref");
    if (ref) sessionStorage.setItem("kortana_ref", ref);
  }, [params]);

  const { walletAddress, isConnected, connect, token } = useWallet();
  const { purchase, step, txHash } = useNodePurchase();

  const { data: tiersData } = useQuery({
    queryKey: ["tiers"],
    queryFn:  async () => (await axios.get(`${API}/api/nodes/tiers`)).data,
  });

  const tiers = tiersData?.tiers ?? [];
  const tier  = tiers[selectedTier];

  // Dedicated balance reader — called on mount, tier change, and after faucet
  async function refreshBalance(addr) {
    if (!addr) return;
    try {
      const readProvider = await getKortanaReadProvider();
      const usdt = await getUSDTContract(readProvider);
      const bal  = await usdt.balanceOf(addr);
      setUsdtBalance(bal);
    } catch (err) {
      console.error("[Balance] read failed:", err.message);
      setUsdtBalance(0n);
    }
  }

  useEffect(() => {
    refreshBalance(walletAddress);
  }, [walletAddress, selectedTier]);

  const totalCost  = tier ? BigInt(tier.priceUSDT) * BigInt(quantity) : 0n;
  const hasBalance = usdtBalance !== null && usdtBalance >= totalCost;
  const isSoldOut  = tier && tier.remaining === 0;
  const maxQty     = tier ? Math.min(10, tier.remaining) : 1;
  const stepIdx    = !isConnected ? 0 : step === "done" ? 3 : reviewStep ? 2 : 1;
  const cfg        = TIER_CONFIG[selectedTier] ?? TIER_CONFIG[0];

  async function handleFaucet() {
    if (!walletAddress) return;
    setFauceting(true);
    try {
      await switchToKortana();
      const signer = await getProvider().getSigner();
      const usdt   = await getUSDTContract(signer);
      toast("Requesting test USDT…", { icon: "⏳" });
      // gasPrice: 1 required on Kortana testnet
      const tx = await usdt.faucet(walletAddress, 10_000n * 1_000_000n, { gasLimit: 300_000, gasPrice: 1 });
      const receipt = await tx.wait();
      if (receipt.status === 0) throw new Error("Transaction reverted on-chain");
      toast.success("10,000 test USDT added to your wallet!");
      // Explicit refresh — do not rely on state-triggered useEffect
      await refreshBalance(walletAddress);
    } catch (err) {
      console.error("[Faucet] error:", err);
      toast.error(err?.reason || err?.shortMessage || err?.message || "Faucet failed");
    } finally {
      setFauceting(false);
    }
  }

  async function handlePurchase() {
    if (!tier) return;
    try {
      await purchase(selectedTier, quantity, totalCost, tier.treasury);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      const ref = sessionStorage.getItem("kortana_ref");
      if (ref && token) {
        axios.post(`${API}/api/user/referral`, { referrerWallet: ref }, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
      setTimeout(() => navigate("/dashboard"), 3500);
    } catch {}
  }

  // ── Complete ──────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="min-h-screen bg-kortana-950 flex items-center justify-center px-6">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-grid-pattern bg-grid" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-kortana-accent/8 blur-[100px] rounded-full" />
        </div>
        <div className="relative max-w-md w-full text-center">
          <div className="text-8xl mb-8 animate-float">🎉</div>
          <div className="card-glass mb-6">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kortana-green/60 to-transparent" />
            <h2 className="text-4xl font-black mb-3 gradient-text">Purchase Complete!</h2>
            <p className="text-gray-400 mb-2">
              Your <span className="text-white font-semibold">{TIER_NAMES[selectedTier]}</span> Node License has been minted.
            </p>
            <p className="text-gray-600 text-sm mb-8">It's now in your wallet and earning DNR rewards every epoch.</p>
            {txHash && (
              <a href={`${EXPLORER}/tx/${txHash}`} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 badge-accent py-2 px-5 text-sm mb-6 hover:brightness-110 transition-all">
                View on Explorer →
              </a>
            )}
            <div className="text-xs text-gray-600 pt-4 border-t border-white/[0.05]">Redirecting to dashboard…</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kortana-950">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern bg-grid" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-kortana-accent/5 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-kortana-950/80 backdrop-blur-xl border-b border-white/[0.06] px-6 py-3.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => reviewStep ? setReviewStep(false) : navigate(-1)}
              className="btn-ghost text-sm px-3 py-2"
            >
              ← Back
            </button>
            <div className="w-px h-5 bg-kortana-700/60" />
            <button onClick={() => navigate("/")}><Logo size="sm" /></button>
          </div>
          {walletAddress && (
            <div className="flex items-center gap-2 bg-kortana-800/60 border border-kortana-700/60 rounded-xl px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-400 font-mono">
                {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="relative max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-1">Purchase a Node</h1>
          <p className="text-gray-600 text-sm">Kortana Testnet · Chain {KORTANA_CHAIN_ID}</p>
        </div>

        <Steps current={stepIdx} />

        {/* ── Step 1: Connect ─────────────────────────────────────────── */}
        {!isConnected && (
          <div className="card-glass text-center py-12">
            <div className="hex-icon text-3xl mx-auto mb-5">🔗</div>
            <h3 className="text-2xl font-black mb-2">Connect Your Wallet</h3>
            <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
              Connect with Kortana Wallet or MetaMask to continue.
            </p>
            <button onClick={connect} className="btn-primary px-12 py-3.5 text-base shadow-glow-accent">
              Connect Wallet
            </button>
          </div>
        )}

        {isConnected && !reviewStep && (
          <div className="space-y-5">
            {/* USDT balance */}
            <div className="card-glass flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="hex-icon text-xl">💵</div>
                <div>
                  <div className="text-xs text-gray-600 uppercase tracking-wider font-semibold">USDT Balance · Kortana Testnet</div>
                  <div className="font-bold">
                    {usdtBalance !== null ? formatUSDT(usdtBalance) : (
                      <span className="skeleton inline-block w-20 h-5 rounded" />
                    )} <span className="text-gray-500 text-sm">USDT</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleFaucet}
                disabled={fauceting}
                className="btn-outline text-xs py-2 px-4 flex items-center gap-1.5"
              >
                {fauceting ? <span className="animate-spin inline-block">⟳</span> : "🚰"}
                {fauceting ? "Requesting…" : "Get Test USDT"}
              </button>
            </div>

            {/* Tier selection */}
            <div className="card-glass">
              <h3 className="text-base font-bold mb-4 text-gray-300 uppercase tracking-wider text-xs">Select a Tier</h3>
              <div className="grid grid-cols-2 gap-3">
                {tiers.length === 0
                  ? [0,1,2,3].map(i => <div key={i} className="skeleton h-36 rounded-xl" />)
                  : tiers.map((t, i) => {
                    const c        = TIER_CONFIG[i] ?? TIER_CONFIG[0];
                    const selected = selectedTier === t.tierId;
                    const soldOut  = t.remaining === 0;
                    return (
                      <button
                        key={t.tierId}
                        onClick={() => { if (!soldOut) { setSelectedTier(t.tierId); setQuantity(1); } }}
                        disabled={soldOut}
                        className={[
                          "relative text-left p-4 rounded-xl border-2 transition-all duration-200 overflow-hidden",
                          selected ? `${c.border} ${c.bg} ring-2 ${c.ring}` : "border-kortana-700/60 hover:border-kortana-600/60 bg-kortana-800/30",
                          soldOut ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:-translate-y-0.5",
                        ].join(" ")}
                      >
                        {selected && <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-current to-transparent ${c.accent} opacity-60`} />}
                        <div className="text-2xl mb-2">{TIER_ICONS[i]}</div>
                        <div className="font-bold text-sm mb-0.5">{t.name}</div>
                        <div className={`text-base font-black ${selected ? c.accent : "text-gray-300"}`}>
                          {formatUSDT(t.priceUSDT)} USDT
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{DNR_RATES[i]} DNR/epoch</div>
                        <div className="text-xs text-gray-700 mt-0.5">
                          {soldOut ? "SOLD OUT" : `${t.remaining.toLocaleString()} left`}
                        </div>
                        {selected && (
                          <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs border ${c.border} ${c.accent} ${c.bg}`}>✓</div>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Quantity */}
            {tier && !isSoldOut && (
              <div className="card-glass">
                <h3 className="text-base font-bold mb-5 text-gray-300 uppercase tracking-wider text-xs">Quantity</h3>
                <div className="flex items-center gap-6 mb-4">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-12 h-12 rounded-xl border-2 border-kortana-700/60 hover:border-kortana-accent/60 text-xl font-black flex items-center justify-center transition-colors hover:bg-kortana-accent/5"
                  >−</button>
                  <span className="text-5xl font-black w-16 text-center tabular-nums">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                    className="w-12 h-12 rounded-xl border-2 border-kortana-700/60 hover:border-kortana-accent/60 text-xl font-black flex items-center justify-center transition-colors hover:bg-kortana-accent/5"
                  >+</button>
                  <span className="text-sm text-gray-600">max {maxQty}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500">Total:</span>
                  <span className={`font-black text-lg ${cfg.accent}`}>{formatUSDT(totalCost)} USDT</span>
                  <span className="text-gray-700">·</span>
                  <span className="text-kortana-green font-semibold">{quantity * DNR_RATES[selectedTier]} DNR/day</span>
                </div>
              </div>
            )}

            {tier && !isSoldOut && (
              <button onClick={() => setReviewStep(true)} className="btn-primary w-full text-base py-4 shadow-glow-sm">
                Review Order →
              </button>
            )}

            {isSoldOut && tier && (
              <div className="card-glass text-center py-10 border-red-500/20">
                <div className="text-4xl mb-3 opacity-50">⬡</div>
                <p className="text-red-400 font-bold text-lg mb-1">{tier.name} is Sold Out</p>
                <p className="text-gray-600 text-sm">Please select a different tier.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Review Order ────────────────────────────────────── */}
        {isConnected && reviewStep && step !== "done" && (
          <div className="space-y-5">
            <div className="card-glass">
              <h3 className="text-xl font-black mb-6">Order Summary</h3>

              {/* Tier summary */}
              {tier && (
                <div className={`flex items-start gap-4 p-4 rounded-xl border-2 mb-5 ${cfg.border} ${cfg.bg} relative overflow-hidden`}>
                  <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-current ${cfg.accent} opacity-40`} />
                  <div className="text-4xl">{TIER_ICONS[selectedTier]}</div>
                  <div className="flex-1">
                    <div className="font-black text-lg">{tier.name} Node License</div>
                    <div className="text-sm text-gray-500 mb-2">{quantity} × {formatUSDT(tier.priceUSDT)} USDT</div>
                    <ul className="space-y-1">
                      {TIER_PERKS[selectedTier]?.map(p => (
                        <li key={p} className={`text-xs flex items-center gap-1.5 ${cfg.accent}`}>
                          <span>✓</span><span className="text-gray-400">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`text-3xl font-black ${cfg.accent}`}>{quantity}×</div>
                </div>
              )}

              {/* Cost breakdown */}
              <div className="bg-kortana-950/60 rounded-xl p-4 space-y-2.5 text-sm mb-5 border border-white/[0.04]">
                {[
                  ["Price per node", `${formatUSDT(tier?.priceUSDT ?? 0)} USDT`],
                  ["Quantity", String(quantity)],
                  ["Daily DNR earnings", `${quantity * DNR_RATES[selectedTier]} DNR`],
                  ["Annual DNR estimate", `${(quantity * DNR_RATES[selectedTier] * 365).toLocaleString()} DNR`],
                ].map(([label, val], i) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className={i >= 2 ? "text-kortana-green font-semibold" : "text-gray-300"}>{val}</span>
                  </div>
                ))}
                <div className="border-t border-white/[0.06] pt-2.5 flex justify-between font-black text-base">
                  <span>Total</span>
                  <span className={`text-xl ${cfg.accent}`}>{formatUSDT(totalCost)} USDT</span>
                </div>
              </div>

              {/* Balance check */}
              <div className={`flex items-center justify-between p-3.5 rounded-xl mb-5 ${
                hasBalance
                  ? "bg-kortana-green/8 border border-kortana-green/25"
                  : "bg-red-500/8 border border-red-500/25"
              }`}>
                <span className={`text-sm font-semibold ${hasBalance ? "text-kortana-green" : "text-red-400"}`}>
                  {hasBalance ? "✓ Sufficient USDT balance" : "✗ Insufficient USDT balance"}
                </span>
                <span className="text-sm text-gray-500 font-mono">
                  {usdtBalance !== null ? formatUSDT(usdtBalance) : "…"} USDT
                </span>
              </div>

              {!hasBalance && (
                <button
                  onClick={handleFaucet}
                  disabled={fauceting}
                  className="btn-outline w-full text-sm mb-4 flex items-center justify-center gap-2"
                >
                  {fauceting ? <span className="animate-spin">⟳</span> : "🚰"}
                  {fauceting ? "Requesting test USDT…" : "Get 10,000 Test USDT from Faucet"}
                </button>
              )}

              <button
                onClick={handlePurchase}
                disabled={!hasBalance || step === "paying" || step === "waiting"}
                className="btn-primary w-full text-base py-4 shadow-glow-sm"
              >
                {step === "paying"  && <span className="flex items-center justify-center gap-2"><span className="animate-spin">⟳</span> Sending USDT…</span>}
                {step === "waiting" && <span className="flex items-center justify-center gap-2"><span className="animate-spin">⟳</span> Minting License…</span>}
                {step === "idle"    && `Confirm & Buy ${quantity} ${TIER_NAMES[selectedTier]} License${quantity > 1 ? "s" : ""}`}
                {step === "error"   && "Retry Purchase"}
              </button>

              {txHash && (
                <a href={`${EXPLORER}/tx/${txHash}`} target="_blank" rel="noreferrer"
                  className="block text-center text-kortana-accent text-sm mt-3 hover:underline">
                  View transaction →
                </a>
              )}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-700 mt-8">
          By purchasing you agree to the{" "}
          <a href="https://kortana.xyz/legal" target="_blank" rel="noreferrer" className="underline hover:text-gray-400 transition-colors">
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
}
