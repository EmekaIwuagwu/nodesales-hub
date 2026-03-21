"use client";

import React from "react";

interface SwapSettingsProps {
  slippage: number;
  onSlippageChange: (val: number) => void;
}

export function SwapSettings({ slippage, onSlippageChange }: SwapSettingsProps) {
  const options = [0.1, 0.5, 1.0];

  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "var(--radius-lg)",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-active)",
        marginBottom: "20px",
        animation: "slideDown 200ms ease-out",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--text-secondary)",
          marginBottom: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Max Slippage</span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ color: "var(--gold-primary)", fontWeight: 700 }}>{slippage}%</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSlippageChange(opt)}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "var(--radius-md)",
              border: "1px solid",
              borderColor: slippage === opt ? "var(--gold-primary)" : "var(--border-subtle)",
              background: slippage === opt ? "var(--gold-glow)" : "var(--bg-input)",
              color: slippage === opt ? "var(--gold-primary)" : "var(--text-secondary)",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all var(--transition-base)",
            }}
          >
            {opt}%
          </button>
        ))}
        <div
          style={{
            flex: 1.5,
            padding: "8px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-input)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <input
            type="number"
            placeholder="Custom"
            value={options.includes(slippage) ? "" : slippage}
            onChange={(e) => onSlippageChange(parseFloat(e.target.value) || 0.5)}
            style={{
              width: "100%",
              background: "none",
              border: "none",
              outline: "none",
              color: "var(--text-primary)",
              textAlign: "right",
              fontSize: "13px",
              fontWeight: 700,
            }}
          />
          <span
            style={{
              marginLeft: "4px",
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--text-tertiary)",
            }}
          >
            %
          </span>
        </div>
      </div>
    </div>
  );
}
