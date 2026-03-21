"use client";

import React from "react";

export default function LiquidityPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 24px 80px",
        background: `radial-gradient(circle at 90% 90%, rgba(245, 166, 35, 0.05) 0%, transparent 40%),
                     var(--bg-deep)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ marginBottom: "40px", textAlign: "center" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "42px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: "12px",
              background: "linear-gradient(135deg, white, var(--text-secondary))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Concentrated Liquidity
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>
            Add liquidity to pools and earn yield on every trade.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          {/* Liquidity Cards */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass-card"
              style={{
                padding: "24px",
                border: "1px solid var(--border-subtle)",
                transition: "all var(--transition-base)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 800,
                    }}
                  >
                    D
                  </div>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 800,
                      marginLeft: "-12px",
                    }}
                  >
                    U
                  </div>
                  <span style={{ fontWeight: 700, fontSize: "16px" }}>DNR/USDT</span>
                </div>
                <div
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    background: "rgba(255,255,255,0.05)",
                    fontSize: "10px",
                    fontWeight: 800,
                    color: "var(--gold-primary)",
                  }}
                >
                  0.3%
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>TVL</span>
                  <span style={{ fontWeight: 600 }}>$1.2M</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>APY (24h)</span>
                  <span style={{ fontWeight: 600, color: "var(--success)" }}>24.2%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>Volume (24h)</span>
                  <span style={{ fontWeight: 600 }}>$420k</span>
                </div>
              </div>

              <button
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "20px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-active)",
                  color: "var(--text-primary)",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all var(--transition-base)",
                }}
              >
                Add Liquidity
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
