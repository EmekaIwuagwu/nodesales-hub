// components/swap/SwapCard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { ERC20_ABI, SWAP_ROUTER_ABI } from "../../lib/constants/abis";
import { getContractAddress } from "../../lib/constants/addresses";
import { DNR_TOKEN, DNRS_TOKEN, WDNR_TOKEN, TESTNET_TOKENS, Token } from "../../lib/tokens/tokenList";
import { usePool } from "../../lib/hooks/usePool";
import { motion, AnimatePresence } from "framer-motion";

export default function SwapCard() {
  const { address, isConnected } = useAccount();
  const [sellToken, setSellToken] = useState<Token>(DNR_TOKEN);
  const [buyToken, setBuyToken] = useState<Token>(DNRS_TOKEN);
  const [sellAmount, setSellAmount] = useState("");
  const [lastHash, setLastHash] = useState<`0x${string}` | null>(null);

  const { writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isWaiting } = useWaitForTransactionReceipt({ hash: lastHash || undefined });

  // Use WDNR for pool discovery if Native DNR is selected
  const discoverySellToken = sellToken.address === "0x0000000000000000000000000000000000000000" ? WDNR_TOKEN : sellToken;
  const discoveryBuyToken = buyToken.address === "0x0000000000000000000000000000000000000000" ? WDNR_TOKEN : buyToken;

  const { price, poolAddress, isLoading: isPoolLoading } = usePool(discoverySellToken, discoveryBuyToken);

  const buyAmount = price && sellAmount ? (parseFloat(sellAmount) * price).toFixed(4) : "0.0";
  const routerAddress = getContractAddress(72511, "router") as `0x${string}`;

  const handleSwap = async () => {
    if (!isConnected || !sellAmount || !routerAddress) return;

    try {
      const isNative = sellToken.address === "0x0000000000000000000000000000000000000000";
      const amountIn = parseUnits(sellAmount, sellToken.decimals);
      
      const hash = await writeContractAsync({
        address: routerAddress,
        abi: SWAP_ROUTER_ABI,
        functionName: "exactInputSingle",
        args: [
          {
            tokenIn: isNative ? WDNR_TOKEN.address : sellToken.address,
            tokenOut: buyToken.address === "0x0000000000000000000000000000000000000000" ? WDNR_TOKEN.address : buyToken.address,
            fee: 3000,
            recipient: address,
            deadline: BigInt(Math.floor(Date.now() / 1000) + 1200),
            amountIn,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0,
          }
        ],
        value: isNative ? amountIn : undefined,
        gas: BigInt(500000), // Manually set to bypass "Out of Gas" on testnet
      } as any);

      setLastHash(hash);
    } catch (e) {
      console.error("Swap failed", e);
    }
  };

  return (
    <div className="glass-card" style={{ width: "100%", maxWidth: "480px", padding: "24px", background: "rgba(10, 10, 15, 0.82)", borderRadius: "24px", border: "1px solid var(--border-subtle)", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 800, color: "white" }}>Exchange</h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {/* SELL */}
        <div style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Sell</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <input type="number" placeholder="0.0" value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} style={{ background: "transparent", border: "none", color: "white", fontSize: "28px", fontWeight: 600, width: "60%", outline: "none" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: "rgba(255,255,255,0.05)", borderRadius: "14px", border: "1px solid var(--border-subtle)", cursor: "pointer" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--cyan-primary)" }} />
              <span style={{ fontWeight: 700 }}>{sellToken.symbol}</span>
            </div>
          </div>
        </div>

        {/* BUY */}
        <div style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Buy (Estimated)</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <input type="text" readOnly value={buyAmount} style={{ background: "transparent", border: "none", color: "white", fontSize: "28px", fontWeight: 600, width: "60%", outline: "none" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: "rgba(255,255,255,0.05)", borderRadius: "14px", border: "1px solid var(--border-subtle)", cursor: "pointer" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--gold-primary)" }} />
              <span style={{ fontWeight: 700 }}>{buyToken.symbol}</span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {price && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ padding: "12px 0", fontSize: "13px", color: "var(--text-tertiary)", display: "flex", justifyContent: "space-between" }}>
            <span>Exchange Rate</span>
            <span style={{ fontWeight: 700, color: "var(--cyan-primary)" }}>1 {sellToken.symbol} = {price.toFixed(4)} {buyToken.symbol}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSwap}
        disabled={!isConnected || isPending || isWaiting || !sellAmount || !price}
        style={{
          width: "100%",
          padding: "18px",
          marginTop: "12px",
          borderRadius: "16px",
          background: !isConnected || isPending || isWaiting || !sellAmount || !price ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, var(--cyan-primary), #6366f1)",
          border: "none",
          color: "white",
          fontWeight: 800,
          fontSize: "16px",
          cursor: "pointer",
          boxShadow: isConnected && sellAmount && price ? "0 10px 30px rgba(6, 182, 212, 0.2)" : "none",
          transition: "all 300ms",
        }}
      >
        {!isConnected ? "Connect Wallet" : isWaiting ? "Confirming Swap..." : isPending ? "Check Wallet..." : !price ? "Insufficient Liquidity" : "Execute Exchange"}
      </motion.button>
      
      {lastHash && (
         <div style={{ marginTop: "16px", padding: "12px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", fontSize: "12px", textAlign: "center", color: "var(--success)" }}>
            {isWaiting ? "Swap Pending..." : "Swap Successful!"} 
            <br />
            <a href={`https://explorer.testnet.kortana.xyz/tx/${lastHash}`} target="_blank" style={{ color: "var(--success)", fontWeight: 700 }}>View on Explorer</a>
         </div>
      )}
    </div>
  );
}
