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
  { _id: "1", question: "What is a Kortana Node?",           answer: "A Kortana Node License is an ERC-20 token that grants you the right to earn daily DNR rewards from the Kortana blockchain infrastructure." },
  { _id: "2", question: "How often are rewards distributed?", answer: "Rewards are auto-distributed every 24 hours at 12:00 UTC. DNR is sent directly to your wallet — no claiming required." },
  { _id: "3", question: "Can I sell my node license?",        answer: "Yes. Node licenses are standard ERC-20 tokens — fully transferable to any wallet on the Kortana network." },
  { _id: "4", question: "What payment methods are accepted?", answer: "USDT on Kortana Testnet is the accepted payment token. Connect your wallet, select a tier and confirm the transfer." },
  { _id: "5", question: "Do I need to stake or lock tokens?", answer: "No. Just hold the license in any EVM-compatible wallet. Rewards accumulate automatically every epoch." },
];

const NETWORK_STATS = [
  { label: "Validators",  value: "50"      },
  { label: "Block Time",  value: "5 sec"   },
  { label: "Gas Fee",     value: "$0.0001" },
  { label: "Chain ID",    value: "72511"   },
];

export default function Landing() {
  const navigate  = useNavigate();
  const { isConnected, connect } = useWallet();
  const [mobileNav, setMobileNav] = useState(false);
  const [openFaq, setOpenFaq]     = useState(null);

  function handleViewDashboard() {
    if (isConnected) navigate("/dashboard");
    else connect();
  }

  const { data: stats } = useQuery({
    queryKey:        ["platform-stats"],
    refetchInterval: 30_000,
    queryFn: async () => (await axios.get(`${API}/api/nodes/stats`)).data,
  });

  const { data: tiersData } = useQuery({
    queryKey:        ["tiers"],
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
    <div className="min-h-screen bg-kortana-950 overflow-x-hidden">

      {/* ── Background grid + glow ───────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-100" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-kortana-accent/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-kortana-purple/5 rounded-full blur-[100px]" />
      </div>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-kortana-950/70 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="md" />

          {/* Network bar */}
          <div className="hidden lg:flex items-center gap-6">
            {NETWORK_STATS.map(s => (
              <div key={s.label} className="flex items-center gap-1.5 text-xs">
                <span className="text-gray-500">{s.label}</span>
                <span className="font-semibold text-gray-300">{s.value}</span>
              </div>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
            <a href="#tiers"      className="px-3 py-1.5 rounded-lg hover:bg-kortana-800/60 hover:text-white transition-all">Nodes</a>
            <a href="#calculator" className="px-3 py-1.5 rounded-lg hover:bg-kortana-800/60 hover:text-white transition-all">Calculator</a>
            <a href="#faq"        className="px-3 py-1.5 rounded-lg hover:bg-kortana-800/60 hover:text-white transition-all">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <WalletConnect compact />
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-kortana-800/60 transition-colors"
              onClick={() => setMobileNav(v => !v)}
            >
              {mobileNav ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile nav */}
      {mobileNav && (
        <div className="fixed top-[65px] left-0 right-0 z-40 bg-kortana-950/95 backdrop-blur-xl border-b border-white/[0.06] px-6 py-4 flex flex-col gap-1 md:hidden">
          {[["#tiers","Nodes"],["#calculator","Calculator"],["#faq","FAQ"]].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMobileNav(false)}
              className="px-4 py-3 rounded-xl text-gray-300 hover:bg-kortana-800/60 hover:text-white transition-all text-sm font-medium">
              {label}
            </a>
          ))}
        </div>
      )}

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 px-6 text-center">
        <div className="max-w-5xl mx-auto">

          {/* Live pill */}
          <div className="inline-flex items-center gap-2.5 bg-kortana-accent/8 border border-kortana-accent/20 rounded-full px-5 py-2 text-sm text-kortana-accent mb-10 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kortana-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-kortana-accent" />
            </span>
            Live on Kortana Testnet · Chain ID 72511
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.05] tracking-tight">
            Own the{" "}
            <span className="gradient-text">Infrastructure.</span>
            <br />
            <span className="text-white">Earn DNR Forever.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            Purchase a Kortana Node License and earn automatic DNR rewards every epoch.
            Four tiers, transparent on-chain rewards, fully non-custodial.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <button
              onClick={() => navigate("/buy")}
              className="btn-primary text-base px-10 py-4 text-lg shadow-glow-accent"
            >
              Buy a Node →
            </button>
            <button
              onClick={handleViewDashboard}
              className="btn-outline text-base px-10 py-4 text-lg"
            >
              {isConnected ? "View Dashboard" : "Sign In"}
            </button>
          </div>

          {/* Live stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: "Nodes Sold",      value: stats?.totalNodesSold?.toLocaleString()       ?? "—", icon: "⬡" },
              { label: "USDT Raised",     value: stats ? `$${(stats.totalUSDTRaised / 1e6).toFixed(0)}` : "—", icon: "◈" },
              { label: "DNR Distributed", value: stats?.totalDNRDistributed?.toLocaleString()  ?? "—", icon: "◉" },
              { label: "Current Epoch",   value: stats?.currentEpoch?.toLocaleString()         ?? "—", icon: "✦" },
            ].map(stat => (
              <div key={stat.label} className="card-glass text-center py-5 px-4">
                <div className="text-kortana-accent/40 text-lg mb-2">{stat.icon}</div>
                <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>

          {stats?.nextEpochTime && (
            <div className="mt-10">
              <EpochCountdown targetTime={new Date(stats.nextEpochTime)} />
            </div>
          )}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────── */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge-accent mx-auto mb-5">Simple Process</div>
            <h2 className="section-title">How It Works</h2>
            <p className="section-sub">Three steps to start earning DNR every day.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-kortana-accent/30 to-transparent" />

            {[
              { num: "01", icon: "💳", title: "Buy a License",  desc: "Choose your node tier and pay with USDT. Your ERC-20 license token is minted instantly to your wallet." },
              { num: "02", icon: "🔐", title: "Hold in Wallet", desc: "Keep the license token in any EVM wallet. No staking, no lock-up — just hold to earn." },
              { num: "03", icon: "💰", title: "Earn DNR Daily", desc: "DNR rewards accumulate every 24 hours and are sent directly to your wallet automatically." },
            ].map((item, i) => (
              <div key={item.num} className="card-hover group relative">
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-kortana-accent/0 group-hover:bg-kortana-accent/[0.03] transition-all duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-4xl font-black text-kortana-accent/20 font-mono leading-none select-none">{item.num}</div>
                    <div className="hex-icon text-2xl">{item.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Node Tiers ───────────────────────────────────────────────── */}
      <section id="tiers" className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge-accent mx-auto mb-5">Node Licenses</div>
            <h2 className="section-title">Choose Your Tier</h2>
            <p className="section-sub">Pick the investment level that fits your goals.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
                  <div key={i} className="skeleton h-96 rounded-2xl" />
                ))
            }
          </div>
        </div>
      </section>

      {/* ── Calculator ───────────────────────────────────────────────── */}
      <section id="calculator" className="relative py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="badge-accent mx-auto mb-5">ROI Estimator</div>
            <h2 className="section-title">Reward Calculator</h2>
            <p className="section-sub">Estimate your annual DNR earnings before you invest.</p>
          </div>
          <RewardCalculator />
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section id="faq" className="relative py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="badge-accent mx-auto mb-5">Got Questions?</div>
            <h2 className="section-title">FAQ</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={faq._id}
                className={`card-glass transition-all duration-200 cursor-pointer ${openFaq === i ? "border-kortana-accent/30" : "hover:border-white/[0.12]"}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="flex justify-between items-center gap-4">
                  <span className="font-semibold text-base text-white">{faq.question}</span>
                  <span className={`text-kortana-accent/70 text-lg transition-transform duration-200 flex-shrink-0 ${openFaq === i ? "rotate-180" : ""}`}>
                    ⌄
                  </span>
                </div>
                {openFaq === i && (
                  <p className="mt-4 text-gray-500 leading-relaxed text-sm border-t border-white/[0.06] pt-4">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────── */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-kortana-accent/20 bg-gradient-to-br from-kortana-accent/10 via-kortana-800/40 to-kortana-950 p-12 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-kortana-accent/10 blur-3xl rounded-full" />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                Ready to Start Earning?
              </h2>
              <p className="text-gray-400 mb-8 text-lg max-w-xl mx-auto">
                Join node holders already earning DNR every epoch on the Kortana network.
              </p>
              <button
                onClick={() => navigate("/buy")}
                className="btn-primary text-lg px-12 py-4 shadow-glow-accent"
              >
                Buy a Node Now →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo size="sm" />
          <div className="flex gap-6 text-sm text-gray-500">
            <a href={`${import.meta.env.VITE_EXPLORER_URL}`} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Explorer</a>
            <a href="https://kortana.xyz/legal"              target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Legal</a>
            <a href="https://kortana.xyz/ecosystem"          target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Ecosystem</a>
          </div>
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} Kortana Group LLC — Wyoming, USA</p>
        </div>
      </footer>
    </div>
  );
}
