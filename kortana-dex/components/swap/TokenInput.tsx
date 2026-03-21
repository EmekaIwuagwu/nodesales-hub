"use client";

import React from "react";
import { motion } from "framer-motion";
import { Token } from "../../lib/tokens/tokenList";

interface TokenInputProps {
  label: string;
  token: Token;
  amount: string;
  balance: string;
  onAmountChange: (val: string) => void;
  onTokenSelect: () => void;
  showMax?: boolean;
  onMax?: () => void;
  isOutput?: boolean;
}

export function TokenInput({
  label,
  token,
  amount,
  balance,
  onAmountChange,
  onTokenSelect,
  showMax,
  onMax,
  isOutput,
}: TokenInputProps) {
  return (
    <div
      style={{
        padding: "16px",
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "20px",
        transition: "all var(--transition-base)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(255, 255, 255, 0.1)";
        el.style.background = "rgba(255, 255, 255, 0.04)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(255, 255, 255, 0.05)";
        el.style.background = "rgba(255, 255, 255, 0.03)";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "12px",
          color: "var(--text-tertiary)",
          fontSize: "13px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        <span>{label}</span>
        {balance && (
          <span style={{ fontSize: "12px", fontWeight: 500 }}>
            Balance: <span style={{ color: "var(--text-secondary)" }}>{parseFloat(balance).toFixed(4)}</span>
          </span>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <input
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: "28px",
            fontWeight: 600,
            width: "100%",
            outline: "none",
            fontFamily: "var(--font-mono)",
          }}
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onTokenSelect}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            background: "rgba(255, 255, 255, 0.07)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "14px",
            color: "white",
            cursor: "pointer",
            transition: "all var(--transition-base)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          {/* Token Symbol/Icon */}
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--cyan-primary), #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: 800,
            }}
          >
            {token.symbol[0]}
          </div>
          <span style={{ fontWeight: 700, fontSize: "15px" }}>{token.symbol}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </motion.button>
      </div>

      {showMax && parseFloat(balance) > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
          <button
            onClick={onMax}
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "var(--cyan-primary)",
              background: "rgba(6, 182, 212, 0.1)",
              border: "1px solid rgba(6, 182, 212, 0.2)",
              padding: "4px 8px",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all var(--transition-base)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "rgba(6, 182, 212, 0.2)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "rgba(6, 182, 212, 0.1)";
            }}
          >
            MAX
          </button>
        </div>
      )}
    </div>
  );
}
