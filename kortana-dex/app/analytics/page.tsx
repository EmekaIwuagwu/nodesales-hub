"use client";

import React from "react";

export default function AnalyticsPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 24px 80px",
        background: `radial-gradient(circle at 50% 50%, rgba(0, 210, 200, 0.05) 0%, transparent 60%),
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
            Analytics Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>
            Track volume, liquidity, and top performing pairs.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "24px",
            marginBottom: "40px",
          }}
        >
          {/* Analytics Stats */}
          {[
            { label: "Total Value Locked", value: "$15.8M", change: "+12.4%" },
            { label: "Volume (24h)", value: "$1.24M", change: "+6.8%" },
            { label: "Volume (7d)", value: "$8.4M", change: "-2.1%" },
            { label: "Total Transactions", value: "142k", change: "+15.2%" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card"
              style={{
                padding: "24px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  color: "var(--text-tertiary)",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "8px",
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-numbers)",
                  fontSize: "24px",
                  fontWeight: 600,
                  color: "white",
                  marginBottom: "4px",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: stat.change.startsWith("+") ? "var(--success)" : "var(--error)",
                }}
              >
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        <div
          className="glass-card"
          style={{
            padding: "40px",
            textAlign: "center",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div
            style={{
              height: "200px",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-around",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            {/* Chart Bars Placeholder */}
            {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 1, 0.7, 0.9, 0.6, 0.8, 0.5].map((h, i) => (
              <div
                key={i}
                style={{
                  width: "100%",
                  height: h * 100 + "%",
                  background: "linear-gradient(to top, var(--teal-primary), var(--gold-primary))",
                  borderRadius: "4px 4px 0 0",
                  opacity: 0.6 + h * 0.4,
                }}
              ></div>
            ))}
          </div>
          <div style={{ color: "var(--text-tertiary)", fontSize: "14px" }}>
            Real-time charts will be available once pools are indexed.
          </div>
        </div>
      </div>
    </main>
  );
}
