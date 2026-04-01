// app/pool/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { usePositions } from "../../lib/hooks/usePositions";
import { TESTNET_TOKENS } from "../../lib/tokens/tokenList";
import { motion } from "framer-motion";

export default function PoolPage() {
  const { isConnected, address } = useAccount();
  const { positions, balance, isLoading } = usePositions();

  const getTokenSymbol = (addr: string) => {
    const t = TESTNET_TOKENS.find(tk => tk.address.toLowerCase() === addr.toLowerCase());
    return t ? t.symbol : addr.substring(0, 6);
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
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(circle at 10% 10%, rgba(245, 166, 35, 0.05) 0%, transparent 40%)", pointerEvents: "none" }} />
      
      <div style={{ maxWidth: "1000px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "48px" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "42px", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "12px", background: "linear-gradient(135deg, white, var(--text-secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              My Positions
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>
              Manage your concentrated liquidity and collect earned trading fees.
            </p>
          </div>
          <Link href="/pool/create" style={{ textDecoration: "none" }}>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ padding: "12px 24px", borderRadius: "12px", background: "var(--cyan-primary)", border: "none", color: "white", fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(6, 182, 212, 0.2)" }}>
              + Create New Position
            </motion.button>
          </Link>
        </div>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <div className="spinner" style={{ margin: "0 auto 16px" }} />
            <div style={{ color: "var(--text-tertiary)" }}>Indexing your positions...</div>
          </div>
        ) : balance > 0 && positions.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
            {positions.map((pos) => (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={pos.tokenId} className="glass-card" style={{ padding: "32px", border: "1px solid var(--border-subtle)", background: "rgba(10, 10, 15, 0.7)", position: "relative" }}>
                 <div style={{ position: "absolute", top: 12, right: 12, padding: "4px 10px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.1)", color: "var(--success)", fontSize: "11px", fontWeight: 800 }}>ACTIVE</div>
                 
                 <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                    <div style={{ display: "flex" }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--cyan-primary)", border: "2px solid #1a1a1a" }} />
                      <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--gold-primary)", border: "2px solid #1a1a1a", marginLeft: "-8px" }} />
                    </div>
                    <div>
                       <span style={{ fontWeight: 800, fontSize: "20px" }}>{getTokenSymbol(pos.token0)} / {getTokenSymbol(pos.token1)}</span>
                       <span style={{ marginLeft: "8px", color: "var(--text-tertiary)", fontSize: "14px" }}># {pos.tokenId}</span>
                    </div>
                 </div>

                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                    <div style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                       <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "4px" }}>Min Price</div>
                       <div style={{ fontWeight: 700 }}>{pos.tickLower}</div>
                    </div>
                    <div style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                       <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "4px" }}>Max Price</div>
                       <div style={{ fontWeight: 700 }}>{pos.tickUpper}</div>
                    </div>
                 </div>

                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                       Fee Tier: <span style={{ color: "white", fontWeight: 700 }}>{(pos.fee / 10000).toFixed(2)}%</span>
                    </div>
                    <Link href={`/pool/manage/${pos.tokenId}`}>
                       <button style={{ padding: "8px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", color: "white", cursor: "pointer" }}>Manage</button>
                    </Link>
                 </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ padding: "80px", textAlign: "center", border: "2px dashed var(--border-subtle)", borderRadius: "24px", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ color: "var(--text-tertiary)", fontSize: "18px", marginBottom: "24px" }}>No active positions found in this Enclave.</div>
            <Link href="/pool/create" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.05 }} style={{ padding: "16px 32px", borderRadius: "16px", background: "var(--gold-primary)", border: "none", color: "black", fontWeight: 800, cursor: "pointer", boxShadow: "0 10px 30px rgba(245, 166, 35, 0.3)" }}>
                Initialize Your First Position
              </motion.button>
            </Link>
          </div>
        )}
      </div>
      <style jsx>{`
        .spinner { width: 24px; height: 24px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--cyan-primary); border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
