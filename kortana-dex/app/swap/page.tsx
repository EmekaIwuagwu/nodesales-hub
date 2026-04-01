"use client";

import React from "react";
import SwapCard from "../../components/swap/SwapCard";
import { motion } from "framer-motion";

export default function SwapPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "100px 24px 80px",
        background: "#050505",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Dynamic Background Mesh */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          background: `
            radial-gradient(circle at 10% 10%, rgba(6, 182, 212, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 90% 90%, rgba(99, 102, 241, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(245, 166, 35, 0.03) 0%, transparent 60%)
          `,
          filter: "blur(100px)",
        }}
      />

      {/* Floating Ambient Glows */}
      <motion.div
        animate={{
          x: [0, 40, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          top: "10%",
          left: "20%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "rgba(6, 182, 212, 0.05)",
          filter: "blur(60px)",
          zIndex: 1,
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          position: "relative",
          zIndex: 5,
        }}
      >
        {/* Statistics Header */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "32px",
            marginBottom: "60px",
          }}
        >
          {[
            { label: "24h Volume", value: "$1.24M" },
            { label: "Active Pools", value: "24" },
            { label: "Total Liquidity", value: "$15.8M" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{ textAlign: "center" }}
            >
              <div
                style={{
                  color: "var(--text-tertiary)",
                  fontSize: "12px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
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
                  textShadow: "0 0 20px rgba(255,255,255,0.1)",
                }}
              >
                {stat.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Card */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <SwapCard />
        </div>
      </div>
    </main>
  );
}
