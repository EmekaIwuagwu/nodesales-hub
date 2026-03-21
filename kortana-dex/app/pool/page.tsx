"use client";

import React from "react";

export default function PoolPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 24px 80px",
        background: `radial-gradient(circle at 10% 10%, rgba(0, 210, 200, 0.05) 0%, transparent 40%),
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
            Liquidity Pools
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>
            Provide concentrated liquidity and earn fees on all swaps.
          </p>
        </div>

        {/* Empty State / Coming Soon for now */}
        <div
          className="glass-card"
          style={{
            padding: "80px 20px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            border: "1px dashed var(--border-subtle)",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-tertiary)",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2v20m10-10H2" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>No active positions</h3>
            <p style={{ color: "var(--text-tertiary)", fontSize: "14px", maxWidth: "340px", margin: "0 auto" }}>
              Your liquidity positions will appear here. Start providing liquidity to earn fees.
            </p>
          </div>
          <button
            style={{
              padding: "12px 28px",
              borderRadius: "var(--radius-full)",
              background: "linear-gradient(135deg, var(--teal-primary), var(--teal-dim))",
              border: "none",
              color: "var(--bg-deep)",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 0 30px rgba(0, 210, 200, 0.2)",
            }}
          >
            Create New Position
          </button>
        </div>
      </div>
    </main>
  );
}
