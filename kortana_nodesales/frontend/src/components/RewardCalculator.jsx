import { useState } from "react";

const TIERS = [
  { id: 0, name: "Genesis",  price: 300,  dnrPerDay: 1,  icon: "⚡", accent: "text-blue-400",   border: "border-blue-500/40",   bg: "bg-blue-500/10"   },
  { id: 1, name: "Early",    price: 500,  dnrPerDay: 2,  icon: "🌟", accent: "text-kortana-accent", border: "border-kortana-accent/40", bg: "bg-kortana-accent/10" },
  { id: 2, name: "Full",     price: 1000, dnrPerDay: 5,  icon: "🔥", accent: "text-orange-400",  border: "border-orange-500/40",  bg: "bg-orange-500/10"  },
  { id: 3, name: "Premium",  price: 2000, dnrPerDay: 10, icon: "💎", accent: "text-purple-400",  border: "border-purple-500/40",  bg: "bg-purple-500/10"  },
];

export default function RewardCalculator() {
  const [tierId,   setTierId]   = useState(1);
  const [dnrPrice, setDnrPrice] = useState(0.01);
  const [qty,      setQty]      = useState(1);

  const tier      = TIERS[tierId];
  const annualDNR = tier.dnrPerDay * 365 * qty;
  const annualUSD = annualDNR * dnrPrice;
  const invested  = tier.price * qty;
  const roi       = ((annualUSD / invested) * 100).toFixed(1);

  return (
    <div className="card-glass">
      {/* Tier selector */}
      <div className="mb-6">
        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3 block">Node Tier</label>
        <div className="grid grid-cols-2 gap-2">
          {TIERS.map(t => (
            <button
              key={t.id}
              onClick={() => setTierId(t.id)}
              className={`
                py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all duration-200 flex items-center gap-2
                ${tierId === t.id
                  ? `${t.border} ${t.bg} ${t.accent}`
                  : "border-kortana-700/60 text-gray-500 hover:border-kortana-600 hover:text-gray-300"}
              `}
            >
              <span>{t.icon}</span> {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Quantity</label>
          <span className={`text-sm font-bold ${tier.accent}`}>{qty} node{qty > 1 ? "s" : ""}</span>
        </div>
        <input
          type="range" min="1" max="50" value={qty}
          onChange={e => setQty(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>1</span><span>50</span>
        </div>
      </div>

      {/* DNR price */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">DNR Price</label>
          <span className="text-sm font-bold text-kortana-green">${dnrPrice.toFixed(4)}</span>
        </div>
        <input
          type="range" min="0.0001" max="1" step="0.0001" value={dnrPrice}
          onChange={e => setDnrPrice(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>$0.0001</span><span>$1.00</span>
        </div>
      </div>

      {/* Results */}
      <div className="divider pt-6 grid grid-cols-2 gap-3">
        <div className="card text-center py-4 px-3">
          <div className="text-xl font-black text-white">${invested.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Investment</div>
        </div>
        <div className="card text-center py-4 px-3">
          <div className="text-xl font-black text-kortana-accent">{annualDNR.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Annual DNR</div>
        </div>
        <div className="card text-center py-4 px-3">
          <div className="text-xl font-black text-white">
            ${annualUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">USD Estimate</div>
        </div>
        <div className={`rounded-2xl border text-center py-4 px-3 ${parseFloat(roi) > 0 ? "border-kortana-green/30 bg-kortana-green/5" : "border-kortana-700 bg-kortana-800"}`}>
          <div className={`text-xl font-black ${parseFloat(roi) > 100 ? "text-kortana-green" : "text-white"}`}>
            {roi}%
          </div>
          <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Est. ROI</div>
        </div>
      </div>

      <p className="text-xs text-gray-600 mt-5 text-center leading-relaxed">
        Projections are estimates only and do not constitute financial advice.
      </p>
    </div>
  );
}
