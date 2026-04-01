// app/pool/create/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { DNR_TOKEN, DNRS_TOKEN, WDNR_TOKEN, Token } from "../../../lib/tokens/tokenList";
import { useAddLiquidity } from "../../../lib/hooks/useAddLiquidity";
import { usePool } from "../../../lib/hooks/usePool";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function CreatePositionPage() {
  const { isConnected, address } = useAccount();
  const [token0, setToken0] = useState<Token>(DNR_TOKEN);
  const [token1, setToken1] = useState<Token>(DNRS_TOKEN);
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");
  
  const [tickLower, setTickLower] = useState("-60000");
  const [tickUpper, setTickUpper] = useState("60000");
  const [lastHash, setLastHash] = useState<`0x${string}` | null>(null);

  const actualToken0 = token0.address === "0x0000000000000000000000000000000000000000" ? WDNR_TOKEN : token0;
  const actualToken1 = token1.address === "0x0000000000000000000000000000000000000000" ? WDNR_TOKEN : token1;

  const { mint, approve, needsApproval0, needsApproval1, refetch0, refetch1, isPending, txHash, errorMsg } = useAddLiquidity(actualToken0, actualToken1, amount0, amount1);
  const { price } = usePool(actualToken0, actualToken1);
  
  const { isLoading: isWaiting, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: lastHash || undefined });

  // Auto-refetch when transaction confirms
  useEffect(() => {
    if (isConfirmed) {
      console.log("🔄 Transaction confirmed. Refetching allowances...");
      refetch0();
      refetch1();
    }
  }, [isConfirmed, refetch0, refetch1]);

  const handleMint = async () => {
    try {
      if (needsApproval0) {
        const hash = await approve(actualToken0);
        if (hash) setLastHash(hash as `0x${string}`);
        return;
      }
      if (needsApproval1) {
        const hash = await approve(actualToken1);
        if (hash) setLastHash(hash as `0x${string}`);
        return;
      }
      const hash = await mint(parseInt(tickLower), parseInt(tickUpper));
      if (hash) setLastHash(hash as `0x${string}`);
    } catch (e) {
      console.error("Action failed", e);
    }
  };

  return (
    <main 
      style={{ 
        minHeight: "100vh", 
        padding: "120px 24px 80px", 
        background: "var(--bg-deep)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.05) 0%, transparent 50%)", pointerEvents: "none" }} />
      
      <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/liquidity" style={{ textDecoration: "none" }}>
            <motion.div whileHover={{ x: -4 }} style={{ color: "var(--text-secondary)", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to Liquidity
            </motion.div>
          </Link>
        </div>

        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "42px", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "8px", color: "white" }}>
            Add {token0.symbol}/{token1.symbol} Liquidity
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>
            Create a concentrated liquidity position to earn active trading fees.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="glass-card" style={{ padding: "28px", background: "rgba(10, 10, 15, 0.82)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--cyan-primary)", marginBottom: "20px" }}>Set Amounts</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Token 1</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <input type="number" value={amount0} onChange={(e) => setAmount0(e.target.value)} placeholder="0.0" style={{ background: "transparent", border: "none", color: "white", fontSize: "24px", fontWeight: 600, width: "60%", outline: "none" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--cyan-primary)" }} />
                      <span style={{ fontWeight: 700 }}>{token0.symbol}</span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Token 2</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <input type="number" value={amount1} onChange={(e) => setAmount1(e.target.value)} placeholder="0.0" style={{ background: "transparent", border: "none", color: "white", fontSize: "24px", fontWeight: 600, width: "60%", outline: "none" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--gold-primary)" }} />
                      <span style={{ fontWeight: 700 }}>{token1.symbol}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: "28px", background: "rgba(10, 10, 15, 0.82)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--cyan-primary)", marginBottom: "20px" }}>Set Price Range</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px", display: "block" }}>Min Price (Tick)</span>
                  <input type="number" value={tickLower} onChange={(e) => setTickLower(e.target.value)} style={{ background: "transparent", border: "none", color: "white", fontSize: "18px", fontWeight: 700, width: "100%", textAlign: "center", outline: "none" }} />
                </div>
                <div style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px", display: "block" }}>Max Price (Tick)</span>
                  <input type="number" value={tickUpper} onChange={(e) => setTickUpper(e.target.value)} style={{ background: "transparent", border: "none", color: "white", fontSize: "18px", fontWeight: 700, width: "100%", textAlign: "center", outline: "none" }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="glass-card" style={{ padding: "24px", background: "rgba(10, 10, 15, 0.9)" }}>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ fontSize: "12px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Selected Fee Tier</div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "white" }}>0.3%</div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMint}
                disabled={!isConnected || isPending || isWaiting || !amount0 || !amount1}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "14px",
                  background: !isConnected || isPending || isWaiting || !amount0 || !amount1 ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, var(--cyan-primary), #6366f1)",
                  border: "none",
                  color: "white",
                  fontWeight: 800,
                  fontSize: "15px",
                  cursor: "pointer",
                  boxShadow: isConnected && amount0 && amount1 ? "0 8px 24px rgba(6, 182, 212, 0.2)" : "none",
                  transition: "all 300ms"
                }}
              >
                {!isConnected ? "Connect Wallet" : isWaiting ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <div className="spinner" />
                    <span>Confirming...</span>
                  </div>
                ) : isPending ? "Waiting for Wallet..." : needsApproval0 ? `Approve ${token0.symbol}` : needsApproval1 ? `Approve ${token1.symbol}` : "Mint Position"}
              </motion.button>
            </div>

            {errorMsg && (
               <div style={{ padding: "16px", borderRadius: "16px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", fontSize: "13px", textAlign: "center", color: "var(--error)" }}>
                  {errorMsg}
               </div>
            )}

            {lastHash && (
               <div style={{ padding: "16px", borderRadius: "16px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", fontSize: "13px", textAlign: "center", color: "var(--success)" }}>
                  {isWaiting ? "Transaction Pending..." : "Transaction Confirmed!"} 
                  <br />
                  <a href={`https://explorer.testnet.kortana.xyz/tx/${lastHash}`} target="_blank" style={{ color: "var(--success)", fontWeight: 700 }}>View on Explorer</a>
               </div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
