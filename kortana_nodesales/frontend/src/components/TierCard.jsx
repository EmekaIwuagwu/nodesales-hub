import { formatUSDT } from "../utils/contracts";

const DNR_RATES = [1, 2, 5, 10];

const TIER_CONFIG = [
  {
    accent:  "text-blue-400",
    border:  "border-blue-500/30",
    bg:      "bg-blue-500/5",
    glow:    "shadow-blue-500/10",
    bar:     "from-blue-400 to-cyan-400",
    badge:   null,
    symbol:  "⬡",
  },
  {
    accent:  "text-kortana-accent",
    border:  "border-kortana-accent/40",
    bg:      "bg-kortana-accent/5",
    glow:    "shadow-kortana-accent/20",
    bar:     "from-kortana-accent to-kortana-green",
    badge:   { label: "Most Popular", cls: "badge-accent" },
    symbol:  "◈",
  },
  {
    accent:  "text-orange-400",
    border:  "border-orange-500/30",
    bg:      "bg-orange-500/5",
    glow:    "shadow-orange-500/10",
    bar:     "from-orange-400 to-yellow-400",
    badge:   null,
    symbol:  "○",
  },
  {
    accent:  "text-purple-400",
    border:  "border-purple-500/40",
    bg:      "bg-purple-500/5",
    glow:    "shadow-purple-500/10",
    bar:     "from-purple-400 to-pink-400",
    badge:   { label: "Limited", cls: "badge-gold" },
    symbol:  "✦",
  },
];

const TIER_PERKS = [
  ["Early adopter tier", "1 DNR per epoch", "Transferable ERC-20"],
  ["2× reward rate",     "2 DNR per epoch", "Transferable ERC-20"],
  ["5× reward rate",     "5 DNR per epoch", "Priority support"],
  ["10× reward rate",    "10 DNR per epoch","Exclusive benefits"],
];

export default function TierCard({ tier, icon, onBuy }) {
  const cfg       = TIER_CONFIG[tier.tierId] ?? TIER_CONFIG[0];
  const pct       = tier.maxSupply > 0 ? Math.min(100, (tier.sold / tier.maxSupply) * 100) : 0;
  const soldOut   = tier.remaining === 0;
  const annualDNR = DNR_RATES[tier.tierId] * 365;
  const perks     = TIER_PERKS[tier.tierId] ?? [];

  return (
    <div className={`
      group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300
      ${cfg.border} ${cfg.bg}
      hover:shadow-xl hover:${cfg.glow} hover:-translate-y-1 hover:border-opacity-60
      bg-kortana-800/60 backdrop-blur-sm shadow-card
    `}>
      {/* Top glow strip */}
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${cfg.bar} opacity-60`} />

      {/* Badge */}
      {cfg.badge && !soldOut && (
        <div className="absolute top-4 right-4">
          <span className={cfg.badge.cls}>{cfg.badge.label}</span>
        </div>
      )}
      {soldOut && (
        <div className="absolute top-4 right-4">
          <span className="badge-red">Sold Out</span>
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        {/* Symbol + icon */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl border ${cfg.border} ${cfg.bg}`}>
            {icon}
          </div>
          <div>
            <div className={`text-xs font-bold uppercase tracking-widest ${cfg.accent} opacity-70`}>{cfg.symbol} Node</div>
            <h3 className="text-xl font-black text-white leading-tight">{tier.name}</h3>
          </div>
        </div>

        {/* Price */}
        <div className="mb-5">
          <div className={`text-4xl font-black ${cfg.accent} leading-none`}>
            {formatUSDT(tier.priceUSDT)}
            <span className="text-base font-semibold text-gray-500 ml-1">USDT</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">per license · one-time</div>
        </div>

        {/* Perks */}
        <ul className="space-y-2 mb-6 flex-1">
          {perks.map(p => (
            <li key={p} className="flex items-center gap-2 text-sm">
              <span className={`${cfg.accent} text-xs`}>✓</span>
              <span className="text-gray-400">{p}</span>
            </li>
          ))}
        </ul>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className={`rounded-xl p-3 text-center ${cfg.bg} border ${cfg.border}`}>
            <div className={`text-lg font-black ${cfg.accent}`}>{DNR_RATES[tier.tierId]}</div>
            <div className="text-xs text-gray-500">DNR / day</div>
          </div>
          <div className={`rounded-xl p-3 text-center ${cfg.bg} border ${cfg.border}`}>
            <div className={`text-lg font-black ${cfg.accent}`}>{annualDNR.toLocaleString()}</div>
            <div className="text-xs text-gray-500">DNR / year</div>
          </div>
        </div>

        {/* Supply progress */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>{tier.sold.toLocaleString()} minted</span>
            <span>{tier.maxSupply.toLocaleString()} max</span>
          </div>
          <div className="progress-track">
            <div
              className={`progress-fill bg-gradient-to-r ${cfg.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-xs text-gray-600 mt-1.5">{pct.toFixed(1)}% filled</div>
        </div>

        {/* CTA */}
        <button
          onClick={onBuy}
          disabled={soldOut}
          className={
            soldOut
              ? "w-full py-3 rounded-xl bg-kortana-700/50 text-gray-600 cursor-not-allowed text-sm font-semibold border border-kortana-700"
              : `w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 border ${cfg.border} ${cfg.accent}
                 bg-white/[0.04] hover:bg-white/[0.08] hover:shadow-lg group-hover:scale-[1.01]`
          }
        >
          {soldOut ? "Sold Out" : `Buy ${tier.name} Node →`}
        </button>
      </div>
    </div>
  );
}
