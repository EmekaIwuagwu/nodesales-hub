import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery }    from "@tanstack/react-query";
import axios           from "axios";
import TierCard        from "../components/TierCard";
import RewardCalculator from "../components/RewardCalculator";
import EpochCountdown  from "../components/EpochCountdown";
import WalletConnect   from "../components/WalletConnect";
import Logo            from "../components/Logo";
import { useWallet }   from "../hooks/useWallet";

const API = import.meta.env.VITE_API_URL || "";

const TIER_ICONS   = ["⚡", "🌟", "🔥", "💎"];
const TIER_COLOURS = ["from-blue-500/20", "from-cyan-500/20", "from-orange-500/20", "from-purple-500/20"];

const FAQS_FALLBACK = [
  { _id: "1", question: "What is a Kortana Node?",          answer: "A Kortana Node License is an ERC-20 token giving you the right to earn daily DNR rewards from the Kortana blockchain infrastructure." },
  { _id: "2", question: "How often are rewards distributed?", answer: "Rewards are distributed every 24 hours at 12:00 UTC. DNR accumulates on-chain and you can claim at any time." },
  { _id: "3", question: "Can I sell my node license?",       answer: "Yes. Node licenses are standard ERC-20 tokens — fully transferable to any wallet." },
  { _id: "4", question: "What payment methods are accepted?", answer: "USDT (BEP-20 on BSC) is the accepted payment token. Connect your wallet and approve the exact purchase amount." },
];

export default function Landing() {
  const navigate  = useNavigate();
  const { isConnected, connect } = useWallet();
  const [mobileNav, setMobileNav] = useState(false);

  function handleViewDashboard() {
    if (isConnected) navigate("/dashboard");
    else connect(); // opens wallet modal → on success user can go to dashboard
  }

  const { data: stats } = useQuery({
    queryKey:       ["platform-stats"],
    refetchInterval: 30_000,
    queryFn: async () => (await axios.get(`${API}/api/nodes/stats`)).data,
  });

  const { data: tiersData } = useQuery({
    queryKey:       ["tiers"],
    refetchInterval: 60_000,
    queryFn: async () => (await axios.get(`${API}/api/nodes/tiers`)).data,
  });

  const { data: faqData } = useQuery({
    queryKey: ["faqs"],
    queryFn:  async () => (await axios.get(`${API}/api/faq`)).data,
  });

  const tiers = tiersData?.tiers ?? [];
  const faqs  = faqData ?? FAQS_FALLBACK;

  return (
    <div className="min-h-screen bg-kortana-900">
      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-kortana-900/80 border-b border-kortana-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="md" />
          <div className="hidden md:flex gap-8 text-sm text-gray-300">
            <a href="#tiers"      className="hover:text-white transition-colors">Nodes</a>
            <a href="#calculator" className="hover:text-white transition-colors">Calculator</a>
            <a href="#faq"        className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <WalletConnect compact />
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setMobileNav(v => !v)}
              aria-label="Toggle menu"
            >
              {mobileNav ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile nav dropdown */}
      {mobileNav && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-kortana-800 border-b border-kortana-700 px-6 py-4 flex flex-col gap-4 text-sm md:hidden">
          {["#tiers", "#calculator", "#faq"].map((href, i) => (
            <a
              key={href}
              href={href}
              onClick={() => setMobileNav(false)}
              className="text-gray-300 hover:text-white transition-colors py-1"
            >
              {["Nodes", "Calculator", "FAQ"][i]}
            </a>
          ))}
        </div>
      )}

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Hero logo */}
          <div className="flex justify-center mb-8">
            <Logo size="xl" text={false} />
          </div>

          <div className="inline-flex items-center gap-2 bg-kortana-accent/10 border border-kortana-accent/30 rounded-full px-4 py-2 text-sm text-kortana-accent mb-8">
            <span className="w-2 h-2 rounded-full bg-kortana-accent animate-pulse" />
            Live on Kortana Testnet · Chain ID 72511
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Own the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-kortana-accent to-kortana-green">
              Infrastructure
            </span>
            <br />Earn DNR Forever.
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Purchase a Kortana Node License and earn automatic DNR rewards every epoch.
            Four tiers, transparent on-chain rewards, fully non-custodial.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate("/buy")} className="btn-primary text-lg px-8 py-4">
              Buy a Node
            </button>
            <button onClick={handleViewDashboard} className="btn-outline text-lg px-8 py-4">
              {isConnected ? "View Dashboard" : "Sign In"}
            </button>
          </div>

          {/* Live stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
            {[
              { label: "Nodes Sold",         value: stats?.totalNodesSold?.toLocaleString()      ?? "—" },
              { label: "USDT Raised",         value: stats ? `$${(stats.totalUSDTRaised / 1e6).toFixed(0)}` : "—" },
              { label: "DNR Distributed",     value: stats?.totalDNRDistributed?.toLocaleString() ?? "—" },
              { label: "Current Epoch",       value: stats?.currentEpoch?.toLocaleString()        ?? "—" },
            ].map(stat => (
              <div key={stat.label} className="card text-center">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          {stats?.nextEpochTime && (
            <div className="mt-8">
              <EpochCountdown targetTime={new Date(stats.nextEpochTime)} />
            </div>
          )}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-400 mb-16">Three simple steps to start earning DNR daily.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: "💳", title: "Buy a License",     desc: "Choose your node tier and pay with USDT. Your ERC-20 license token is minted instantly to your wallet." },
              { step: "02", icon: "🔐", title: "Hold in Wallet",    desc: "Keep the license token in any EVM wallet. No staking, no lock-up — just hold to earn." },
              { step: "03", icon: "💰", title: "Earn DNR Daily",    desc: "DNR rewards accumulate every 24 hours. Claim any time directly to your wallet." },
            ].map(item => (
              <div key={item.step} className="card relative">
                <div className="absolute -top-3 -left-3 bg-kortana-accent text-kortana-900 text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center">
                  {item.step}
                </div>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Node Tiers ───────────────────────────────────────────── */}
      <section id="tiers" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Node Tiers</h2>
          <p className="text-gray-400 text-center mb-16">Choose the tier that fits your investment.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.length > 0
              ? tiers.map((tier, i) => (
                  <TierCard
                    key={tier.tierId}
                    tier={tier}
                    icon={TIER_ICONS[i]}
                    gradientClass={TIER_COLOURS[i]}
                    onBuy={() => navigate(`/buy?tier=${tier.tierId}`)}
                  />
                ))
              : [0, 1, 2, 3].map(i => (
                  <div key={i} className="card animate-pulse h-80" />
                ))
            }
          </div>
        </div>
      </section>

      {/* ── Calculator ───────────────────────────────────────────── */}
      <section id="calculator" className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Reward Calculator</h2>
          <p className="text-gray-400 text-center mb-12">Estimate your annual DNR earnings.</p>
          <RewardCalculator />
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">FAQ</h2>
          <div className="space-y-4">
            {faqs.map(faq => (
              <details key={faq._id} className="card group">
                <summary className="cursor-pointer font-semibold text-lg flex justify-between items-center list-none">
                  {faq.question}
                  <span className="text-kortana-accent transition-transform group-open:rotate-180">▼</span>
                </summary>
                <p className="mt-4 text-gray-400 leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-kortana-700 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo size="sm" />
          <div className="flex gap-6 text-sm text-gray-400">
            <a href={`${import.meta.env.VITE_EXPLORER_URL}`} target="_blank" rel="noreferrer" className="hover:text-white">Explorer</a>
            <a href="https://kortana.xyz/legal"              target="_blank" rel="noreferrer" className="hover:text-white">Legal</a>
            <a href="https://kortana.xyz/ecosystem"          target="_blank" rel="noreferrer" className="hover:text-white">Ecosystem</a>
          </div>
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} Kortana Group LLC — Wyoming, USA</p>
        </div>
      </footer>
    </div>
  );
}
