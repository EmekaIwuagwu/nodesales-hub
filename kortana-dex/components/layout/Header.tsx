"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useChainId, useSwitchChain, useAccount, useSignMessage } from "wagmi";
import { kortanaTestnet, kortanaMainnet } from "../../lib/constants/chains";

const NAV_ITEMS = [
  { label: "Swap",       href: "/swap"      },
  { label: "Pools",      href: "/pool"       },
  { label: "Liquidity",  href: "/liquidity"  },
  { label: "Analytics",  href: "/analytics"  },
];

export function Header() {
  const pathname = usePathname();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { isConnected, address } = useAccount();
  const { signMessage } = useSignMessage();
  const [scrolled, setScrolled] = useState(false);

  // Authenticate on Connection (BelloMundo Handshake)
  useEffect(() => {
    if (isConnected && address) {
      const authKey = `kortana_auth_${address}`;
      const isAuthed = sessionStorage.getItem(authKey);
      
      if (!isAuthed) {
        // This triggers the "Sign Request" popup in the Kortana Wallet extension
        signMessage({ 
          message: "Welcome to Kortana Exchange!\n\nPlease sign this message to authenticate your secure session with the smart city liquidity layer." 
        });
        sessionStorage.setItem(authKey, "true");
      }
    }
  }, [isConnected, address, signMessage]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isCorrectChain =
    chainId === kortanaTestnet.id || chainId === kortanaMainnet.id;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 24px",
        height: "72px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled
          ? "rgba(3, 6, 8, 0.92)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled
          ? "1px solid var(--border-subtle)"
          : "1px solid transparent",
        transition: "all 400ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Logo */}
      <Link href="/swap" style={{ textDecoration: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              filter: "drop-shadow(0 0 12px rgba(6, 182, 212, 0.4))",
            }}
          >
            <svg width="34" height="34" viewBox="0 0 100 100" fill="none">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="35%" stopColor="#3b82f6" />
                  <stop offset="65%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
                <clipPath id="hexagonHole">
                  <path d="M0,0 H100 V100 H0 Z M52,44 L62,50 L62,62 L52,68 L42,62 L42,50 Z" clipRule="evenodd" />
                </clipPath>
              </defs>
              <g clipPath="url(#hexagonHole)">
                <path d="M15 10 H42 V90 H15 Z" fill="url(#logoGrad)" fillOpacity="0.9" />
                <path d="M42 45 L75 10 H95 L55 50 Z" fill="url(#logoGrad)" />
                <path d="M55 50 L95 90 H75 L42 55 Z" fill="url(#logoGrad)" />
              </g>
              <path d="M15 10 L42 10 L30 50 L15 90 Z" fill="white" fillOpacity="0.05" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "20px", letterSpacing: "-0.03em", color: "white", lineHeight: 1.1 }}>KORTANA</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--cyan-primary)", letterSpacing: "0.2em", textTransform: "uppercase", lineHeight: 1, fontWeight: 700 }}>EXCHANGE</div>
          </div>
        </div>
      </Link>

      {/* Navigation */}
      <nav style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{ padding: "8px 16px", borderRadius: "100px", fontFamily: "var(--font-display)", fontWeight: isActive ? 600 : 500, fontSize: "14px", color: isActive ? "var(--gold-primary)" : "var(--text-secondary)", background: isActive ? "rgba(245, 166, 35, 0.08)" : "transparent", transition: "all 400ms" }}>{item.label}</div>
            </Link>
          );
        })}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <ConnectButton />
      </div>
    </header>
  );
}
