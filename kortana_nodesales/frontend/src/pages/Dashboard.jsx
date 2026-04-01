import { useState }      from "react";
import { useNavigate }   from "react-router-dom";
import { useQuery }      from "@tanstack/react-query";
import axios             from "axios";
import { useWallet }     from "../hooks/useWallet";
import { useRewards }    from "../hooks/useRewards";
import EpochCountdown    from "../components/EpochCountdown";
import RewardHistory     from "../components/RewardHistory";
import Logo              from "../components/Logo";
import WalletConnect     from "../components/WalletConnect";

const API = import.meta.env.VITE_API_URL || "";

const TIER_NAMES  = ["Genesis", "Early", "Full", "Premium"];
const TIER_ICONS  = ["⚡", "🌟", "🔥", "💎"];
const TIER_CONFIG = [
  { accent: "text-blue-400",   border: "border-blue-500/30",   bg: "bg-blue-500/8",   bar: "from-blue-400 to-cyan-400"     },
  { accent: "text-kortana-accent", border: "border-kortana-accent/30", bg: "bg-kortana-accent/8", bar: "from-kortana-accent to-kortana-green" },
  { accent: "text-orange-400", border: "border-orange-500/30", bg: "bg-orange-500/8", bar: "from-orange-400 to-yellow-400" },
  { accent: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/8", bar: "from-purple-400 to-pink-400"   },
];
const DNR_RATES = [1, 2, 5, 10];

function StatCard({ label, value, suffix = "", icon, accent = "text-kortana-accent", sub }) {
  return (
    <div className="relative overflow-hidden card group hover:border-kortana-accent/20 transition-all duration-300">
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-kortana-accent/3 blur-2xl pointer-events-none" />
      <div className="flex items-center justify-between mb-4">
        <div className="hex-icon text-xl">{icon}</div>
        <span className="text-xs text-gray-600 uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <div className={`text-3xl font-black ${accent} leading-none`}>
        {value}
        {suffix && <span className="text-sm font-semibold text-gray-500 ml-1.5">{suffix}</span>}
      </div>
      {sub && <div className="text-xs text-gray-600 mt-2">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const { walletAddress, token, disconnect } = useWallet();

  const { data: portfolio } = useQuery({
    queryKey:        ["portfolio", token],
    enabled:         !!token,
    refetchInterval: 30_000,
    queryFn: async () => (await axios.get(`${API}/api/user/portfolio`, {
      headers: { Authorization: `Bearer ${token}` },
    })).data,
  });

  const { pending, nextEpoch } = useRewards(token);

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-kortana-950 flex flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-grid-pattern bg-grid" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-kortana-accent/6 blur-[100px] rounded-full" />
        </div>
        <div className="relative">
          <Logo size="xl" text={false} />
        </div>
        <div className="relative">
          <h2 className="text-4xl font-black mb-3">Node Dashboard</h2>
          <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
            Connect your wallet to view your node portfolio and track DNR earnings.
          </p>
        </div>
        <WalletConnect />
        <button onClick={() => navigate("/")} className="btn-ghost text-sm">
          ← Back to home
        </button>
      </div>
    );
  }

  const nodeSummary = portfolio?.nodeSummary ?? {};
  const totalNodes  = Object.values(nodeSummary).reduce((a, b) => a + b, 0);
  const dailyDNR    = Object.entries(nodeSummary).reduce(
    (sum, [tid, qty]) => sum + qty * DNR_RATES[parseInt(tid)], 0
  );
  const pendingDNR  = parseFloat(pending || "0");
  const refLink     = `${window.location.origin}/buy?ref=${walletAddress}`;

  function copyRef() {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-kortana-950 pb-24">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern bg-grid" />
        <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-kortana-accent/4 blur-[120px] rounded-full" />
      </div>

      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-kortana-950/80 backdrop-blur-xl border-b border-white/[0.06] px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center">
            <Logo size="md" />
          </button>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-kortana-800/60 border border-kortana-700/60 rounded-xl px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <span className="text-sm text-gray-300 font-mono">
                {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
              </span>
            </div>
            <button onClick={() => navigate("/buy")} className="btn-primary text-sm py-2 px-5">
              + Buy Node
            </button>
            <button onClick={disconnect} className="btn-outline text-sm py-2 px-4">
              Disconnect
            </button>
          </div>
        </div>
      </header>

      <div className="relative max-w-6xl mx-auto px-6 pt-10">
        {/* ── Page title ──────────────────────────────────────────── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black">My Dashboard</h1>
            <span className="badge-accent hidden sm:inline-flex">Active</span>
          </div>
          <p className="text-gray-600 text-sm">Kortana Testnet · Chain 72511</p>
        </div>

        {/* ── Stats row ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="⬡" label="Total Nodes"     value={totalNodes}
            accent="text-kortana-accent" />
          <StatCard icon="⚡" label="Daily Earnings"  value={dailyDNR.toLocaleString()} suffix="DNR"
            accent="text-yellow-400" />
          <StatCard icon="◈" label="Total DNR Earned" value={parseFloat(portfolio?.totalEarned ?? 0).toFixed(2)} suffix="DNR"
            accent="text-kortana-green" />
          <StatCard icon="◉" label="USDT Invested"    value={`$${((portfolio?.totalUSDTInvested ?? 0) / 1e6).toFixed(0)}`}
            accent="text-blue-400" />
        </div>

        {/* ── Epoch row ─────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-5 mb-8">
          {/* Earnings card */}
          <div className="relative overflow-hidden rounded-2xl border border-kortana-accent/25 bg-gradient-to-br from-kortana-accent/10 via-kortana-800/40 to-kortana-950 p-6 shadow-card">
            <div className="absolute top-0 right-0 w-40 h-40 bg-kortana-accent/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kortana-accent/40 to-transparent" />
            <div className="relative">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-4">Next Epoch Earnings</p>
              <div className="text-6xl font-black text-kortana-accent mb-1 leading-none text-glow">
                {pendingDNR.toFixed(0)}
              </div>
              <div className="text-kortana-accent/50 text-sm mb-6">DNR per epoch</div>
              <div className="flex items-center gap-2.5 bg-kortana-accent/10 border border-kortana-accent/20 rounded-xl px-4 py-3">
                <span className="text-kortana-green text-base">✓</span>
                <span className="text-sm text-gray-400">Auto-distributed every epoch — no claim needed</span>
              </div>
            </div>
          </div>

          {/* Epoch countdown */}
          <div className="card flex flex-col">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-4">Next Reward Epoch</p>
            <div className="flex-1">
              {nextEpoch?.nextEpochTimestamp
                ? <EpochCountdown targetTime={new Date(nextEpoch.nextEpochTimestamp * 1000)} />
                : <div className="text-gray-600 text-sm">Loading epoch data…</div>
              }
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-gray-600 border-t border-white/[0.05] pt-4">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kortana-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-kortana-accent" />
              </span>
              Epoch #{nextEpoch?.currentEpoch ?? "—"} · Distributed every 24 hours
            </div>
          </div>
        </div>

        {/* ── My Node Licenses ──────────────────────────────────── */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">My Node Licenses</h3>
            {totalNodes > 0 && (
              <span className="badge-accent">{totalNodes} active</span>
            )}
          </div>

          {Object.keys(nodeSummary).length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4 opacity-30">⬡</div>
              <p className="text-gray-400 mb-2 text-lg font-semibold">No nodes yet</p>
              <p className="text-gray-600 text-sm mb-6">Purchase a node license to start earning DNR rewards automatically.</p>
              <button onClick={() => navigate("/buy")} className="btn-primary">
                Buy Your First Node →
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(nodeSummary).map(([tierId, qty]) => {
                const id  = parseInt(tierId);
                const cfg = TIER_CONFIG[id] ?? TIER_CONFIG[0];
                return (
                  <div key={tierId}
                    className={`relative overflow-hidden rounded-2xl border ${cfg.border} ${cfg.bg} p-5 transition-all duration-200 hover:-translate-y-0.5`}>
                    <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${cfg.bar} opacity-50`} />
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`hex-icon text-lg border ${cfg.border} ${cfg.bg}`}>
                        {TIER_ICONS[id]}
                      </div>
                      <div>
                        <div className={`text-xs font-bold uppercase tracking-widest ${cfg.accent} opacity-70`}>{TIER_NAMES[id]}</div>
                        <div className="text-2xl font-black">{qty}×</div>
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${cfg.accent}`}>{(qty * DNR_RATES[id]).toLocaleString()} DNR / day</div>
                    <div className="text-xs text-gray-600 mt-0.5">{(qty * DNR_RATES[id] * 365).toLocaleString()} DNR / year</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Reward History ────────────────────────────────────── */}
        <div className="card mb-6">
          <h3 className="text-xl font-bold mb-6">Reward History</h3>
          <RewardHistory token={token} />
        </div>

        {/* ── Referral ──────────────────────────────────────────── */}
        <div className="relative overflow-hidden card">
          <div className="absolute top-0 right-0 w-48 h-48 bg-kortana-accent/4 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kortana-accent/20 to-transparent" />
          <div className="relative">
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-xl font-bold">Referral Program</h3>
              <span className="badge-green">5% Commission</span>
            </div>
            <p className="text-gray-500 text-sm mb-5">
              Share your link and earn 5% of every purchase made through it.
            </p>
            <div className="flex gap-3">
              <input
                readOnly value={refLink}
                className="input flex-1 text-sm font-mono text-gray-400"
              />
              <button
                onClick={copyRef}
                className={`btn-outline text-sm py-2.5 px-5 whitespace-nowrap transition-all ${copied ? "!text-kortana-green !border-kortana-green" : ""}`}
              >
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
