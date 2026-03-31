import { useState } from "react";

const TIERS = [
  { id: 0, name: "Genesis",  price: 300,  dnrPerDay: 1    },
  { id: 1, name: "Early",    price: 500,  dnrPerDay: 2    },
  { id: 2, name: "Full",     price: 1000, dnrPerDay: 5    },
  { id: 3, name: "Premium",  price: 2000, dnrPerDay: 10   },
];

export default function RewardCalculator() {
  const [tierId,  setTierId]  = useState(0);
  const [dnrPrice, setDnrPrice] = useState(0.01);
  const [qty, setQty]         = useState(1);

  const tier      = TIERS[tierId];
  const annualDNR = tier.dnrPerDay * 365 * qty;
  const annualUSD = annualDNR * dnrPrice;
  const roi       = ((annualUSD / (tier.price * qty)) * 100).toFixed(1);

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-6">Reward Calculator</h3>

      <div className="space-y-5">
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Node Tier</label>
          <div className="grid grid-cols-2 gap-2">
            {TIERS.map(t => (
              <button
                key={t.id}
                onClick={() => setTierId(t.id)}
                className={`py-2 px-3 rounded-lg text-sm border transition-colors ${
                  tierId === t.id
                    ? "border-kortana-accent bg-kortana-accent/10 text-white"
                    : "border-kortana-700 text-gray-400"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">
            Quantity: <span className="text-white font-bold">{qty}</span>
          </label>
          <input
            type="range" min="1" max="50" value={qty}
            onChange={e => setQty(parseInt(e.target.value))}
            className="w-full accent-kortana-accent"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">
            DNR Price: <span className="text-white font-bold">${dnrPrice.toFixed(4)}</span>
          </label>
          <input
            type="range" min="0.0001" max="1" step="0.0001" value={dnrPrice}
            onChange={e => setDnrPrice(parseFloat(e.target.value))}
            className="w-full accent-kortana-accent"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$0.0001</span><span>$1.00</span>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-kortana-700 grid grid-cols-2 gap-4">
        {[
          { label: "Investment",      value: `$${(tier.price * qty).toLocaleString()}` },
          { label: "Annual DNR",      value: annualDNR.toLocaleString() + " DNR" },
          { label: "Annual USD Est.", value: `$${annualUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
          { label: "Est. ROI",        value: `${roi}%`, highlight: true },
        ].map(item => (
          <div key={item.label} className="text-center">
            <div className={`text-2xl font-bold ${item.highlight ? "text-kortana-green" : "text-white"}`}>
              {item.value}
            </div>
            <div className="text-xs text-gray-400 mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-600 mt-6 text-center">
        Not financial advice. Projections are estimates only and do not guarantee returns.
      </p>
    </div>
  );
}
