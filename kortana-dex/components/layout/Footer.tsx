"use client";

import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer
      style={{
        padding: "80px 24px 40px",
        background: "var(--bg-deep)",
        borderTop: "1px solid var(--border-subtle)",
        position: "relative",
        zIndex: 10,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "40px",
        }}
      >
        {/* Brand Section */}
        <div style={{ flex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                filter: "drop-shadow(0 0 8px rgba(6, 182, 212, 0.3))",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
                <defs>
                   <linearGradient id="footerLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="35%" stopColor="#3b82f6" />
                    <stop offset="65%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#d946ef" />
                  </linearGradient>
                  <clipPath id="footerHexHole">
                    <path d="M0,0 H100 V100 H0 Z M52,44 L62,50 L62,62 L52,68 L42,62 L42,50 Z" clipRule="evenodd" />
                  </clipPath>
                </defs>
                <g clipPath="url(#footerHexHole)">
                  <path d="M15 10 H42 V90 H15 Z" fill="url(#footerLogoGrad)" />
                  <path d="M42 45 L75 10 H95 L55 50 Z" fill="url(#footerLogoGrad)" />
                  <path d="M55 50 L95 90 H75 L42 55 Z" fill="url(#footerLogoGrad)" />
                </g>
              </svg>
            </div>
            <span style={{ fontSize: "16px", fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>KORTANA</span>
          </div>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-secondary)",
              lineHeight: "1.6",
              marginBottom: "20px",
            }}
          >
            The official decentralized exchange of the Kortana Blockchain. 
            Powering the financial heart of the smart city ecosystem with concentrated liquidity.
          </p>
          <div style={{ display: "flex", gap: "12px" }}>
            {["Twitter", "Discord", "Telegram"].map((social) => (
              <a
                key={social}
                href="#"
                style={{
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-elevated)",
                  color: "white",
                  fontSize: "11px",
                  fontWeight: 700,
                  textDecoration: "none",
                  border: "1px solid var(--border-subtle)",
                  transition: "all var(--transition-base)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "var(--gold-primary)";
                  el.style.color = "var(--gold-primary)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "var(--border-subtle)";
                  el.style.color = "white";
                }}
              >
                {social}
              </a>
            ))}
          </div>
        </div>

        {/* Links Sections */}
        {[
          {
            title: "Exchange",
            links: [
              { label: "Swap Tokens", href: "/swap" },
              { label: "Liquidity Pools", href: "/pool" },
              { label: "Analytics", href: "/analytics" },
            ],
          },
          {
            title: "Documentation",
            links: [
              { label: "Whitepaper", href: "#" },
              { label: "Developer SDK", href: "#" },
              { label: "Smart Contracts", href: "#" },
            ],
          },
          {
            title: "Legal",
            links: [
              { label: "Terms of Use", href: "#" },
              { label: "Privacy Policy", href: "#" },
              { label: "Risk Warning", href: "#" },
            ],
          },
        ].map((section) => (
          <div key={section.title}>
            <h4
              style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "24px",
              }}
            >
              {section.title}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {section.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    color: "var(--text-tertiary)",
                    fontSize: "14px",
                    textDecoration: "none",
                    transition: "color var(--transition-base)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color = "var(--text-tertiary)";
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "60px auto 0",
          paddingTop: "24px",
          borderTop: "1px solid var(--border-subtle)",
          textAlign: "center",
          color: "var(--text-tertiary)",
          fontSize: "12px",
        }}
      >
        &copy; {new Date().getFullYear()} KortanaSwap. Powering the DNRS algorithmic stablecoin oracle.
      </div>
    </footer>
  );
}
