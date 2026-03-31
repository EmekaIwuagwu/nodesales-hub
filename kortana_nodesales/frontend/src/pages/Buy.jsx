import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ethers } from "ethers";
import { useQuery }  from "@tanstack/react-query";
import axios         from "axios";
import confetti      from "canvas-confetti";
import { useWallet } from "../hooks/useWallet";
import { useNodePurchase } from "../hooks/useNodePurchase";
import { getProvider, getUSDTContract, formatUSDT } from "../utils/contracts";
import Logo from "../components/Logo";

const API      = import.meta.env.VITE_API_URL || "";
const EXPLORER = import.meta.env.VITE_EXPLORER_URL || "";

const TIER_NAMES  = ["Genesis", "Early", "Full", "Premium"];
const TIER_ICONS  = ["⚡", "🌟", "🔥", "💎"];
const TIER_COLORS = [
  { ring: "border-yellow-500",   bg: "bg-yellow-500/10",   text: "text-yellow-400",   glow: "shadow-yellow-500/20"   },
  { ring: "border-blue-500",     bg: "bg-blue-500/10",     text: "text-blue-400",     glow: "shadow-blue-500/20"     },
  { ring: "border-orange-500",   bg: "bg-orange-500/10",   text: "text-orange-400",   glow: "shadow-orange-500/20"   },
  { ring: "border-purple-500",   bg: "bg-purple-500/10",   text: "text-purple-400",   glow: "shadow-purple-500/20"   },
];
const TIER_PERKS  = [
  ["1 DNR / epoch", "Early adopter tier", "Transferable NFT"],
  ["2 DNR / epoch", "2× reward multiplier", "Transferable NFT"],
  ["5 DNR / epoch", "5× reward multiplier", "Priority support"],
  ["10 DNR / epoch", "10× reward multiplier", "Exclusive benefits"],
];

// ── Step indicator ─────────────────────────────────────────────────────────────
function Steps({ current }) {
  const steps = ["Connect", "Select Tier", "Quantity", "Purchase"];
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((s, i) => {
        const done    = i < current;
        const active  = i === current;
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                done   ? "bg-kortana-accent border-kortana-accent text-kortana-900" :
                active ? "border-kortana-accent text-kortana-accent bg-kortana-accent/10" :
                         "border-kortana-700 text-gray-600"
              }`}>
                {done ? "✓" : i + 1}
              </div>
              <span className={`text-xs mt-1.5 whitespace-nowrap ${active ? "text-kortana-accent font-semibold" : done ? "text-gray-400" : "text-gray-600"}`}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 mb-5 ${done ? "bg-kortana-accent/50" : "bg-kortana-700"}`} />
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
  const [quantity, setQuantity]         = useState(1);
  const [usdtBalance, setUsdtBalance]   = useState(null);

  useEffect(() => {
    const ref = params.get("ref");
    if (ref) sessionStorage.setItem("kortana_ref", ref);
  }, [params]);

  const { walletAddress, isConnected, connect, chainOk, token } = useWallet();
  const { purchase, step, txHash } = useNodePurchase();

  const { data: tiersData } = useQuery({
    queryKey: ["tiers"],
    queryFn:  async () => (await axios.get(`${API}/api/nodes/tiers`)).data,
  });

  const tiers = tiersData?.tiers ?? [];
  const tier  = tiers[selectedTier];

  useEffect(() => {
    if (!walletAddress || !window.ethereum) return;
    (async () => {
      try {
        const provider = getProvider();
        const usdt     = await getUSDTContract(provider);
        const bal      = await usdt.balanceOf(walletAddress);
        setUsdtBalance(bal);
      } catch {}
    })();
  }, [walletAddress, selectedTier]);

  const totalCost  = tier ? BigInt(tier.priceUSDT) * BigInt(quantity) : 0n;
  const hasBalance = usdtBalance !== null && usdtBalance >= totalCost;
  const isSoldOut  = tier && tier.remaining === 0;
  const maxQty     = tier ? Math.min(10, tier.remaining) : 1;

  // Derive current step index for the indicator
  const currentStep = !isConnected ? 0 : step !== "idle" && step !== "error" ? 3 : 1;

  async function handlePurchase() {
    if (!tier) return;
    try {
      await purchase(selectedTier, quantity, totalCost);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

      const ref = sessionStorage.getItem("kortana_ref");
      if (ref && token) {
        axios.post(`${API}/api/user/referral`, { referrerWallet: ref }, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }

      setTimeout(() => navigate("/dashboard"), 3000);
    } catch {}
  }

  // ── Purchase complete screen ─────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="min-h-screen bg-kortana-900 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="relative inline-block mb-6">
            <div className="text-7xl">🎉</div>
            <div className="absolute inset-0 bg-kortana-accent/10 rounded-full blur-2xl" />
          </div>
          <h2 className="text-4xl font-black mb-3">Purchase Complete!</h2>
          <p className="text-gray-400 mb-2">
            Your <span className="text-white font-semibold">{TIER_NAMES[selectedTier]}</span> Node License has been minted.
          </p>
          <p className="text-gray-500 text-sm mb-8">It's now in your wallet and earning DNR rewards.</p>

          {txHash && (
            <a
              href={`${EXPLORER}/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-kortana-accent hover:underline text-sm mb-8 border border-kortana-accent/20 bg-kortana-accent/5 px-4 py-2 rounded-xl"
            >
              View on Explorer →
            </a>
          )}

          <div className="text-xs text-gray-600">Redirecting to dashboard in 3 seconds…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kortana-900">
      {/* Subtle background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-kortana-accent/5 rounded-full blur-3xl" />
      </div>

      {/* ── Minimal header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-kortana-900/80 backdrop-blur-md border-b border-kortana-700/60 px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center">
            <Logo size="sm" />
          </button>
          {walletAddress && (
            <div className="flex items-center gap-2 text-sm text-gray-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
            </div>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10 relative">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-1">Purchase a Node</h1>
          <p className="text-gray-500 text-sm">Kortana Testnet · NFT license minted on-chain</p>
        </div>

        {/* Step indicator */}
        <Steps current={currentStep} />

        {/* ── Step 1: Connect ─────────────────────────────────────────────── */}
        {!isConnected && (
          <div className="bg-kortana-800 border border-kortana-700 rounded-2xl p-8 text-center mb-6">
            <div className="text-5xl mb-4">🔗</div>
            <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              Connect with Kortana Wallet, MetaMask, or any browser wallet to continue.
            </p>
            <button onClick={connect} className="btn-primary px-10">
              Connect Wallet
            </button>
          </div>
        )}

        {isConnected && (
          <div className="space-y-6">
            {/* Chain warning */}
            {!chainOk && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-orange-400 text-sm flex items-center gap-3">
                <span className="text-xl">⚠</span>
                <span>Please switch to <strong>Kortana Testnet</strong> (Chain ID: 72511) in your wallet.</span>
              </div>
            )}

            {/* Balance bar */}
            <div className="bg-kortana-800 border border-kortana-700 rounded-2xl px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-400/10 flex items-center justify-center text-sm">💵</div>
                <div>
                  <div className="text-xs text-gray-500">USDT Balance</div>
                  <div className="font-bold text-sm">{usdtBalance !== null ? formatUSDT(usdtBalance) : "Loading…"}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Wallet</div>
                <div className="font-mono text-xs text-gray-300">{walletAddress?.slice(0, 6)}…{walletAddress?.slice(-4)}</div>
              </div>
            </div>

            {/* ── Step 2: Tier selection ─────────────────────────────────────── */}
            <div className="bg-kortana-800 border border-kortana-700 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-5">Select a Tier</h3>
              <div className="grid grid-cols-2 gap-3">
                {tiers.map((t, i) => {
                  const color    = TIER_COLORS[i] ?? TIER_COLORS[0];
                  const selected = selectedTier === t.tierId;
                  const soldOut  = t.remaining === 0;
                  return (
                    <button
                      key={t.tierId}
                      onClick={() => { if (!soldOut) { setSelectedTier(t.tierId); setQuantity(1); } }}
                      disabled={soldOut}
                      className={[
                        "relative overflow-hidden text-left p-4 rounded-xl border-2 transition-all duration-200",
                        selected
                          ? `${color.ring} ${color.bg} shadow-lg ${color.glow}`
                          : "border-kortana-700 hover:border-kortana-600 bg-kortana-900/50",
                        soldOut ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
                      ].join(" ")}
                    >
                      <div className="text-2xl mb-2">{TIER_ICONS[i]}</div>
                      <div className="font-bold text-sm mb-0.5">{t.name}</div>
                      <div className={`text-base font-black ${selected ? color.text : "text-gray-300"}`}>
                        {formatUSDT(t.priceUSDT)} USDT
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {soldOut ? "SOLD OUT" : `${t.remaining.toLocaleString()} left`}
                      </div>
                      {selected && (
                        <div className={`absolute top-2 right-2 w-5 h-5 rounded-full ${color.bg} ${color.text} flex items-center justify-center text-xs border ${color.ring}`}>
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tier perks */}
            {tier && !isSoldOut && (
              <div className={`border ${TIER_COLORS[selectedTier]?.ring ?? "border-kortana-700"} rounded-xl px-5 py-4 ${TIER_COLORS[selectedTier]?.bg ?? ""}`}>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                  {TIER_NAMES[selectedTier]} includes
                </p>
                <ul className="space-y-1">
                  {TIER_PERKS[selectedTier]?.map(perk => (
                    <li key={perk} className="text-sm flex items-center gap-2">
                      <span className={`${TIER_COLORS[selectedTier]?.text ?? "text-kortana-accent"}`}>✦</span>
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Step 3: Quantity ──────────────────────────────────────────── */}
            {tier && !isSoldOut && (
              <div className="bg-kortana-800 border border-kortana-700 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-5">Select Quantity</h3>
                <div className="flex items-center gap-6 mb-6">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-12 h-12 rounded-xl border-2 border-kortana-700 hover:border-kortana-accent text-xl font-bold flex items-center justify-center transition-colors"
                  >
                    −
                  </button>
                  <span className="text-4xl font-black w-16 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                    className="w-12 h-12 rounded-xl border-2 border-kortana-700 hover:border-kortana-accent text-xl font-bold flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500">max {maxQty}</span>
                </div>

                {/* Order summary */}
                <div className="bg-kortana-900/50 rounded-xl p-4 space-y-2 text-sm mb-5">
                  <div className="flex justify-between text-gray-400">
                    <span>{TIER_ICONS[selectedTier]} {tier.name} × {quantity}</span>
                    <span>{formatUSDT(BigInt(tier.priceUSDT) * BigInt(quantity))} USDT</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Daily DNR earnings</span>
                    <span className="text-green-400 font-semibold">
                      {(tier.dnrPerEpoch / 1e18 * quantity).toLocaleString()} DNR
                    </span>
                  </div>
                  <div className="border-t border-kortana-700 pt-2 flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-kortana-accent text-lg">{formatUSDT(totalCost)} USDT</span>
                  </div>
                </div>

                {!hasBalance && usdtBalance !== null && (
                  <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm flex items-center gap-2">
                    <span>⚠</span>
                    Insufficient USDT — you need {formatUSDT(totalCost)} USDT.
                  </div>
                )}

                {/* ── Purchase button ───────────────────────────────────────── */}
                <button
                  onClick={handlePurchase}
                  disabled={!hasBalance || step === "approving" || step === "purchasing"}
                  className="btn-primary w-full text-base"
                >
                  {step === "approving"  && (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin inline-block">⟳</span> Approving USDT…
                    </span>
                  )}
                  {step === "purchasing" && (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin inline-block">⟳</span> Confirming Purchase…
                    </span>
                  )}
                  {step === "idle"  && `Buy ${quantity} ${tier.name} License${quantity > 1 ? "s" : ""}`}
                  {step === "error" && "Retry Purchase"}
                </button>

                {txHash && (
                  <a
                    href={`${EXPLORER}/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center text-kortana-accent text-sm mt-3 hover:underline"
                  >
                    View transaction →
                  </a>
                )}
              </div>
            )}

            {isSoldOut && tier && (
              <div className="text-center bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
                <div className="text-4xl mb-3">😔</div>
                <p className="text-red-400 font-semibold text-lg mb-1">{tier.name} is Sold Out</p>
                <p className="text-gray-500 text-sm">Please select a different tier.</p>
              </div>
            )}
          </div>
        )}

        {/* Fine print */}
        <p className="text-center text-xs text-gray-600 mt-8">
          By purchasing you agree to the{" "}
          <a href="https://kortana.xyz/legal" target="_blank" rel="noreferrer" className="underline hover:text-gray-400">
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
}
