import { formatUSDT } from "../utils/contracts";

const DNR_RATES = [1, 2, 5, 10];

export default function TierCard({ tier, icon, gradientClass, onBuy }) {
  const pct      = tier.maxSupply > 0 ? (tier.sold / tier.maxSupply) * 100 : 0;
  const soldOut  = tier.remaining === 0;
  const annualDNR = DNR_RATES[tier.tierId] * 365;

  return (
    <div className={`card relative overflow-hidden bg-gradient-to-b ${gradientClass} to-transparent`}>
      {soldOut && (
        <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          SOLD OUT
        </div>
      )}

      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
      <div className="text-3xl font-black text-kortana-accent mb-1">
        {formatUSDT(tier.priceUSDT)}
      </div>
      <div className="text-sm text-gray-400 mb-4">per license</div>

      <div className="space-y-2 mb-6 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Daily DNR</span>
          <span className="font-bold text-kortana-green">{DNR_RATES[tier.tierId]} DNR</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Annual DNR</span>
          <span className="font-bold">{annualDNR.toLocaleString()} DNR</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Remaining</span>
          <span className="font-bold">{tier.remaining.toLocaleString()} / {tier.maxSupply.toLocaleString()}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="w-full bg-kortana-700 rounded-full h-1.5">
          <div
            className="bg-kortana-accent h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">{pct.toFixed(1)}% sold</div>
      </div>

      <button
        onClick={onBuy}
        disabled={soldOut}
        className={soldOut ? "w-full py-3 rounded-xl bg-kortana-700 text-gray-500 cursor-not-allowed" : "btn-primary w-full"}
      >
        {soldOut ? "Sold Out" : "Buy Now"}
      </button>
    </div>
  );
}
