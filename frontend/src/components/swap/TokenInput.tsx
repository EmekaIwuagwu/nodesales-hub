"use client";

import { ChevronDown } from "lucide-react";

interface TokenInputProps {
  label: string;
  token: { symbol: string; address?: string; logo?: string };
  amount: string;
  onAmountChange: (val: string) => void;
  onSelectToken?: () => void;
  balance?: string;
  readOnly?: boolean;
}

export function TokenInput({ label, token, amount, onAmountChange, onSelectToken, balance = "0.00", readOnly }: TokenInputProps) {
  return (
    <div className="bg-bg-tertiary/50 border border-transparent rounded-3xl p-5 hover:border-white/10 transition-all group shadow-inner">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-text-secondary font-bold uppercase tracking-wider opacity-60">{label}</span>
        <span className="text-sm text-text-secondary font-bold select-none bg-white/5 px-3 py-1 rounded-full border border-white/5">
          Balance: {balance}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          value={amount}
          readOnly={readOnly}
          onChange={(e) => {
            const val = e.target.value;
            if (/^\d*\.?\d*$/.test(val)) {
              onAmountChange(val);
            }
          }}
          placeholder="0.0"
          className="bg-transparent text-4xl font-space font-bold text-text-primary placeholder:text-text-tertiary focus:outline-none w-full min-w-0 tracking-tighter"
        />

        <button
          onClick={onSelectToken}
          className="flex items-center gap-2 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap border border-white/10 shadow-lg active:scale-95"
        >
          {token.symbol === "DNR" ? (
            <div className="w-7 h-7 rounded-full bg-accent-dnr flex items-center justify-center text-sm font-bold text-black border border-white/20 shadow-[0_0_15px_rgba(245,200,66,0.3)]">
              K
            </div>
          ) : token.symbol === "mdUSD" ? (
            <div className="w-7 h-7 rounded-full bg-accent-mdusd flex items-center justify-center text-sm font-bold text-white border border-white/20 shadow-[0_0_15px_rgba(33,209,160,0.3)]">
              $
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white border border-white/20">
              {token.symbol.charAt(0)}
            </div>
          )}
          <span className="font-bold text-xl">{token.symbol}</span>
          <ChevronDown size={20} className="text-text-secondary group-hover:text-white transition-colors" />
        </button>
      </div>
    </div>
  );
}
