"use client";

import { useState } from "react";
import { Search, X, Plus, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useReadContract } from "wagmi";
import { ERC20_ABI } from "@/lib/contracts";

interface Token {
  symbol: string;
  name: string;
  address: string;
  logo?: string;
}

const DEFAULT_TOKENS: Token[] = [
  { symbol: "DNR", name: "Kortana Native", address: "native" },
  { symbol: "mdUSD", name: "Meta-Dollar", address: "0x0ABF9D12057BE0c53eF140AA6fB7889C3B13ae11" },
];

interface TokenSelectModalProps {
  onSelect: (token: any) => void;
  onClose: () => void;
}

export function TokenSelectModal({ onSelect, onClose }: TokenSelectModalProps) {
  const [search, setSearch] = useState("");
  const [customAddress, setCustomAddress] = useState("");

  // Check if search is an address
  const isAddress = search.startsWith("0x") && search.length === 42;

  const { data: customTokenName } = useReadContract({
    address: isAddress ? search as `0x${string}` : undefined,
    abi: ERC20_ABI,
    functionName: "name",
    query: { enabled: isAddress }
  });

  const { data: customTokenSymbol } = useReadContract({
    address: isAddress ? search as `0x${string}` : undefined,
    abi: ERC20_ABI,
    functionName: "symbol",
    query: { enabled: isAddress }
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
        <input
          autoFocus
          type="text"
          placeholder="Search name or paste address"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-accent-dnr transition-colors"
        />
      </div>

      <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
        {isAddress && customTokenSymbol ? (
           <button
            onClick={() => onSelect({ symbol: customTokenSymbol, address: search, name: customTokenName })}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors border border-accent-dnr/30 bg-accent-dnr/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">
                {String(customTokenSymbol).charAt(0)}
              </div>
              <div className="flex flex-col items-start">
                <span className="font-bold text-white">{String(customTokenSymbol)}</span>
                <span className="text-xs text-text-secondary">{String(customTokenName)}</span>
              </div>
            </div>
            <div className="bg-accent-dnr text-black text-[10px] font-bold px-2 py-1 rounded-md">FOUND</div>
          </button>
        ) : (
          DEFAULT_TOKENS.filter(t => 
            t.symbol.toLowerCase().includes(search.toLowerCase()) || 
            t.name.toLowerCase().includes(search.toLowerCase())
          ).map((token) => (
            <button
              key={token.address}
              onClick={() => onSelect(token)}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors text-left group"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border border-white/10 ${token.symbol === 'DNR' ? 'bg-accent-dnr text-black' : 'bg-accent-mdusd text-white'}`}>
                {token.symbol === 'DNR' ? 'K' : '$'}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white group-hover:text-accent-dnr transition-colors">{token.symbol}</span>
                <span className="text-xs text-text-secondary">{token.name}</span>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="mt-2 p-4 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-3">
        <Info size={16} className="text-accent-dnr mt-0.5 shrink-0" />
        <p className="text-xs text-text-secondary leading-relaxed">
          To provide liquidity for a new token, paste its contract address above. If no pool exists, we will help you create one.
        </p>
      </div>
    </div>
  );
}
