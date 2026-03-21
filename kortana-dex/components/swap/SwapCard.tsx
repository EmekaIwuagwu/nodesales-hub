"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TokenInput } from "./TokenInput";
import { TokenSelector } from "./TokenSelector";
import { SwapSettings } from "./SwapSettings";
import { TESTNET_TOKENS, DNR_TOKEN, DNRS_TOKEN, Token } from "../../lib/tokens/tokenList";
import { useAccount, useBalance } from "wagmi";

export function SwapCard() {
  const { address, isConnected } = useAccount();
  const [tokenIn, setTokenIn] = useState<Token>(DNR_TOKEN);
  const [tokenOut, setTokenOut] = useState<Token>(DNRS_TOKEN);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectingToken, setSelectingToken] = useState<"in" | "out" | null>(null);

  const { data: balanceIn } = useBalance({
    address,
    token: tokenIn.address === "0x0000000000000000000000000000000000000000" ? undefined : (tokenIn.address as `0x${string}`),
  });

  const { data: balanceOut } = useBalance({
    address,
    token: tokenOut.address === "0x0000000000000000000000000000000000000000" ? undefined : (tokenOut.address as `0x${string}`),
  });

  const handleSwap = () => {
    if (!isConnected) return;
    console.log("Swapping", amountIn, tokenIn.symbol);
  };

  const switchTokens = () => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
    setAmountIn(amountOut);
    setAmountOut(amountIn);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card cyan-accent"
      style={{
        width: "100%",
        maxWidth: "480px",
        padding: "24px",
        margin: "0 auto",
        position: "relative",
        zIndex: 10,
        background: "rgba(10, 10, 10, 0.8)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "24px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em", color: "white" }}>Swap Tokens</span>
        <motion.button onClick={() => setIsSettingsOpen(!isSettingsOpen)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: isSettingsOpen ? "var(--cyan-primary)" : "var(--text-secondary)", width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33 1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001-1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82 1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
        </motion.button>
      </div>

      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
            <SwapSettings slippage={slippage} onSlippageChange={setSlippage} />
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative" }}>
        <TokenInput
          label="Sell"
          token={tokenIn}
          amount={amountIn}
          balance={balanceIn?.formatted || "0"}
          onAmountChange={setAmountIn}
          onTokenSelect={() => setSelectingToken("in")}
          showMax={true}
          onMax={() => setAmountIn(balanceIn?.formatted || "0")}
        />

        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 10 }}>
          <motion.button onClick={switchTokens} style={{ width: "42px", height: "42px", borderRadius: "14px", background: "#1a1a1a", border: "4px solid #0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cyan-primary)" strokeWidth="3"><path d="M7 13l5 5 5-5M7 6l5 5 5-5" /></svg>
          </motion.button>
        </div>

        <TokenInput
          label="Buy"
          token={tokenOut}
          amount={amountOut}
          balance={balanceOut?.formatted || "0"}
          onAmountChange={setAmountOut}
          onTokenSelect={() => setSelectingToken("out")}
          isOutput={true}
        />
      </div>

      <motion.button
        disabled={!isConnected || !amountIn || parseFloat(amountIn) <= 0}
        onClick={handleSwap}
        style={{ width: "100%", padding: "20px", marginTop: "16px", borderRadius: "16px", background: !isConnected || !amountIn || parseFloat(amountIn) <= 0 ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, var(--cyan-primary), #6366f1)", border: "none", color: !isConnected || !amountIn || parseFloat(amountIn) <= 0 ? "var(--text-tertiary)" : "white", fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: 800, cursor: isConnected ? "pointer" : "default", letterSpacing: "0.02em" }}
      >
        {!isConnected ? "Connect Wallet" : !amountIn ? "Enter an amount" : "Swap Tokens"}
      </motion.button>

      <AnimatePresence>
        {selectingToken && (
          <TokenSelector
            excludeToken={selectingToken === "in" ? tokenOut.address : tokenIn.address}
            onClose={() => setSelectingToken(null)}
            onSelect={(t) => {
              if (selectingToken === "in") setTokenIn(t);
              else setTokenOut(t);
              setSelectingToken(null);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
