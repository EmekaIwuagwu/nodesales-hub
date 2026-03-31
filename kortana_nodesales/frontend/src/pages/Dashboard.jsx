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

const API      = import.meta.env.VITE_API_URL || "";
const EXPLORER = import.meta.env.VITE_EXPLORER_URL || "";

const TIER_NAMES = ["Genesis", "Early", "Full", "Premium"];
const TIER_ICONS = ["⚡", "🌟", "🔥", "💎"];
const TIER_COLORS = [
  "from-yellow-500/20 to-yellow-600/5 border-yellow-500/30",
  "from-blue-500/20 to-blue-600/5 border-blue-500/30",
  "from-orange-500/20 to-orange-600/5 border-orange-500/30",
  "from-purple-500/20 to-purple-600/5 border-purple-500/30",
];
const TIER_ACCENT = ["text-yellow-400", "text-blue-400", "text-orange-400", "text-purple-400"];
const DNR_RATES  = [1, 2, 5, 10];

function StatCard({ label, value, suffix = "", icon, accent = "text-kortana-accent", glow }) {
  return (
    <div className={`relative overflow-hidden bg-kortana-800 border border-kortana-700 rounded-2xl p-5 ${glow ? "shadow-lg shadow-kortana-accent/10" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <div className={`text-3xl font-black ${accent}`}>
        {value}<span className="text-lg font-semibold ml-1 opacity-70">{suffix}</span>
      </div>
      {glow && (
        <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-kortana-accent/10 blur-2xl pointer-events-none" />
      )}
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

  const { pending, claim, claiming, nextEpoch } = useRewards(token);

  // ── Not connected ──────────────────────────────────────────────────────────
  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-kortana-900 flex flex-col items-center justify-center gap-8 px-6 text-center">
        {/* Glow backdrop */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-kortana-accent/5 rounded-full blur-3xl" />
        </div>

        <Logo size="xl" text={false} />
        <div>
          <h2 className="text-4xl font-black mb-3">Node Dashboard</h2>
          <p className="text-gray-400 max-w-sm mx-auto leading-relaxed">
            Connect your wallet to view your node portfolio, track earnings, and claim DNR rewards.
          </p>
        </div>
        <WalletConnect />
        <button onClick={() => navigate("/")} className="text-sm text-gray-500 hover:text-gray-300 underline transition-colors">
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
    <div className="min-h-screen bg-kortana-900 pb-24">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-kortana-900/80 backdrop-blur-md border-b border-kortana-700/60 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center">
            <Logo size="md" />
          </button>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-kortana-800 border border-kortana-700 rounded-xl px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-gray-300 font-mono">
                {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
              </span>
            </div>
            <button
              onClick={() => navigate("/buy")}
              className="btn-primary text-sm py-2 px-5"
            >
              + Buy Node
            </button>
            <button
              onClick={disconnect}
              className="btn-outline text-sm py-2 px-4"
            >
              Disconnect
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 pt-10">
        {/* ── Page title ──────────────────────────────────────────────────── */}
        <div className="mb-10">
          <h1 className="text-4xl font-black mb-1">My Dashboard</h1>
          <p className="text-gray-500 text-sm">Kortana Testnet · Chain 72511</p>
        </div>

        {/* ── Stats row ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="🖥" label="Total Nodes"       value={totalNodes}                                          accent="text-kortana-accent"  glow />
          <StatCard icon="⚡" label="Daily Earnings"    value={dailyDNR.toLocaleString()}   suffix="DNR"            accent="text-yellow-400" />
          <StatCard icon="💰" label="Total DNR Earned"  value={parseFloat(portfolio?.totalEarned ?? 0).toFixed(2)} suffix="DNR" accent="text-green-400" />
          <StatCard icon="💵" label="USDT Invested"     value={`$${((portfolio?.totalUSDTInvested ?? 0) / 1e6).toFixed(0)}`} accent="text-blue-400" />
        </div>

        {/* ── Claim + Countdown ───────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Claim card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-kortana-accent/15 via-kortana-800 to-kortana-800 border border-kortana-accent/30 rounded-2xl p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-kortana-accent/10 rounded-full blur-2xl pointer-events-none" />
            <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-3">Pending Rewards</p>
            <div className="text-5xl font-black text-kortana-accent mb-1">
              {pendingDNR.toFixed(4)}
            </div>
            <div className="text-kortana-accent/60 text-sm mb-6">DNR ready to claim</div>
            <button
              onClick={claim}
              disabled={claiming || pendingDNR === 0}
              className="btn-primary w-full text-base"
            >
              {claiming ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin inline-block">⟳</span> Claiming…
                </span>
              ) : "Claim DNR Rewards"}
            </button>
          </div>

          {/* Epoch countdown */}
          <div className="bg-kortana-800 border border-kortana-700 rounded-2xl p-6 flex flex-col">
            <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-3">Next Reward Epoch</p>
            <div className="flex-1">
              {nextEpoch?.nextEpochTimestamp ? (
                <EpochCountdown targetTime={new Date(nextEpoch.nextEpochTimestamp * 1000)} />
              ) : (
                <div className="text-gray-500 text-sm">Loading epoch data…</div>
              )}
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <span className="w-2 h-2 rounded-full bg-kortana-accent animate-pulse" />
              Epoch #{nextEpoch?.currentEpoch ?? "—"} · Distributed every 24 hours
            </div>
          </div>
        </div>

        {/* ── My Node Licenses ────────────────────────────────────────────── */}
        <div className="bg-kortana-800 border border-kortana-700 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">My Node Licenses</h3>
            {totalNodes > 0 && (
              <span className="bg-kortana-accent/10 border border-kortana-accent/20 text-kortana-accent text-sm px-3 py-1 rounded-full font-semibold">
                {totalNodes} active
              </span>
            )}
          </div>

          {Object.keys(nodeSummary).length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🖥</div>
              <p className="text-gray-400 mb-2 text-lg font-semibold">No nodes yet</p>
              <p className="text-gray-500 text-sm mb-6">Purchase a node license to start earning DNR rewards.</p>
              <button onClick={() => navigate("/buy")} className="btn-primary">
                Buy Your First Node
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(nodeSummary).map(([tierId, qty]) => {
                const id = parseInt(tierId);
                return (
                  <div
                    key={tierId}
                    className={`relative overflow-hidden bg-gradient-to-br ${TIER_COLORS[id]} border rounded-xl p-4`}
                  >
                    <div className="text-3xl mb-2">{TIER_ICONS[id]}</div>
                    <div className="font-bold text-sm mb-1">{TIER_NAMES[id]}</div>
                    <div className="text-2xl font-black mb-3">{qty}×</div>
                    <div className="text-xs text-gray-400">
                      <div className={`font-semibold ${TIER_ACCENT[id]}`}>{(qty * DNR_RATES[id]).toLocaleString()} DNR / day</div>
                      <div className="text-gray-500 mt-0.5">{(qty * DNR_RATES[id] * 365).toLocaleString()} DNR / year</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Reward History ──────────────────────────────────────────────── */}
        <div className="bg-kortana-800 border border-kortana-700 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-bold mb-6">Reward History</h3>
          <RewardHistory token={token} />
        </div>

        {/* ── Referral ────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-kortana-800 via-kortana-800 to-kortana-accent/5 border border-kortana-700 rounded-2xl p-6">
          <div className="absolute top-0 right-0 w-40 h-40 bg-kortana-accent/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-xl font-bold">Referral Program</h3>
            <span className="text-xs bg-kortana-accent/10 border border-kortana-accent/20 text-kortana-accent px-2.5 py-1 rounded-full font-semibold">
              5% Commission
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-5">
            Share your link and earn 5% of every purchase made through it.
          </p>
          <div className="flex gap-3">
            <input
              readOnly
              value={refLink}
              className="flex-1 bg-kortana-900 border border-kortana-700 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-300 focus:outline-none"
            />
            <button onClick={copyRef} className={`btn-outline text-sm py-2 px-5 whitespace-nowrap transition-all ${copied ? "text-green-400 border-green-400" : ""}`}>
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
