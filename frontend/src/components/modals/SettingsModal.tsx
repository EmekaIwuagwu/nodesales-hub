"use client";

import { useState } from "react";
import { Info } from "lucide-react";

interface SettingsModalProps {
  onClose: () => void;
  slippage: number;
  setSlippage: (val: number) => void;
}

export function SettingsModal({ slippage, setSlippage, onClose }: SettingsModalProps) {
  const [customSlippage, setCustomSlippage] = useState(slippage.toString());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
          Slippage Tolerance
          <div className="group relative">
            <Info size={14} className="cursor-help text-text-tertiary" />
            <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-bg-secondary border border-white/10 rounded-lg text-[10px] scale-0 group-hover:scale-100 transition-transform origin-bottom-left z-50 shadow-2xl">
              Your transaction will revert if the price changes unfavorably by more than this percentage.
            </div>
          </div>
        </label>
        
        <div className="flex gap-2">
          {[0.1, 0.5, 1.0].map((val) => (
            <button
              key={val}
              onClick={() => {
                setSlippage(val);
                setCustomSlippage(val.toString());
              }}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all border ${
                slippage === val 
                  ? "bg-accent-dnr border-accent-dnr text-black shadow-[0_0_15px_rgba(245,200,66,0.2)]" 
                  : "bg-white/5 border-white/10 text-text-secondary hover:bg-white/10"
              }`}
            >
              {val}%
            </button>
          ))}
          <div className="flex-1 relative">
            <input
              type="text"
              value={customSlippage}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*\.?\d*$/.test(val)) {
                  setCustomSlippage(val);
                  const parsed = parseFloat(val);
                  if (!isNaN(parsed)) setSlippage(parsed);
                }
              }}
              className="w-full h-full bg-white/5 border border-white/10 rounded-xl py-2 pl-3 pr-6 text-sm font-bold text-white focus:outline-none focus:border-accent-dnr transition-colors"
              placeholder="Custom"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-tertiary">%</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <label className="text-sm font-medium text-text-secondary">Transaction Deadline</label>
        <div className="flex items-center gap-2">
            <input 
                type="text" 
                defaultValue="20" 
                className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm font-bold text-white w-20 focus:outline-none focus:border-accent-dnr transition-colors"
            />
            <span className="text-sm text-text-secondary font-medium">Minutes</span>
        </div>
      </div>
    </div>
  );
}
