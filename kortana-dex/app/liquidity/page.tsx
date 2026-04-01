"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const POOLS = [
  { pair: "DNR/DNRS", token0: "DNR", token1: "DNRS", fee: "0.3%", tvl: "$1.2M", apr: "24.2%", vol: "$420k" },
  { pair: "DNR/USDT", token0: "DNR", token1: "USDT", fee: "0.3%", tvl: "$850k", apr: "18.5%", vol: "$120k" },
  { pair: "DNRS/USDT", token0: "DNRS", token1: "USDT", fee: "0.05%", tvl: "$2.1M", apr: "4.2%", vol: "$85k" },
];

export default function LiquidityPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "120px 24px 80px",
        background: `radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.08) 0%, transparent 50%), var(--bg-deep)`,
        position: "relative",
      }}
    >
      <div style={{ width: "100%", maxWidth: "1100px", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: "48px", textAlign: "center" }}>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "48px",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              marginBottom: "16px",
              background: "linear-gradient(135deg, white, var(--text-secondary))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Liquidity Pools
          </motion.h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "18px", maxWidth: "600px", margin: "0 auto" }}>
            Provision liquidity to the Kortana Enclave and earn protocol fees on every high-speed trade.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {POOLS.map((pool, i) => (
            <motion.div
              key={pool.pair}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card"
              style={{ padding: "32px", border: "1px solid var(--border-subtle)", background: "rgba(10, 10, 15, 0.7)", position: "relative", overflow: "hidden" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ display: "flex" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--cyan-primary)", border: "2px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "12px" }}>{pool.token0[0]}</div>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--gold-primary)", border: "2px solid #1a1a1a", marginLeft: "-12px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "12px" }}>{pool.token1[0]}</div>
                  </div>
                  <span style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.02em" }}>{pool.pair}</span>
                </div>
                <span style={{ fontSize: "12px", fontWeight: 700, padding: "4px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", color: "var(--cyan-primary)" }}>{pool.fee}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-tertiary)", fontSize: "14px" }}>TVL</span>
                  <span style={{ fontWeight: 700 }}>{pool.tvl}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-tertiary)", fontSize: "14px" }}>APR</span>
                  <span style={{ fontWeight: 700, color: "var(--success)" }}>{pool.apr}</span>
                </div>
              </div>

              <Link href="/pool/create" style={{ textDecoration: "none" }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: "14px",
                    background: i === 0 ? "linear-gradient(135deg, var(--cyan-primary), #6166f1)" : "rgba(255,255,255,0.05)",
                    border: "none",
                    color: i === 0 ? "white" : "var(--text-primary)",
                    fontWeight: 800,
                    fontSize: "15px",
                    cursor: "pointer",
                    boxShadow: i === 0 ? "0 8px 24px rgba(6, 182, 212, 0.2)" : "none",
                    transition: "all 300ms",
                  }}
                >
                  Add Liquidity
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
