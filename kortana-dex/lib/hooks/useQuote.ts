// lib/hooks/useQuote.ts
"use client";

import { usePool } from "./usePool";
import { Token } from "../tokens/tokenList";
import { useMemo } from "react";
import { parseUnits, formatUnits } from "viem";

export function useQuote(tokenIn?: Token, tokenOut?: Token, amountInStr: string = "0") {
  const { price, isLoading } = usePool(tokenIn, tokenOut);

  const amountOut = useMemo(() => {
    if (!tokenIn || !tokenOut || !amountInStr || isNaN(parseFloat(amountInStr)) || isNaN(Number(price))) return "0";
    
    // Check order of tokens in pool (token0, token1)
    const isToken0 = tokenIn.address.toLowerCase() < tokenOut.address.toLowerCase();
    
    const amountIn = parseFloat(amountInStr);
    let rawAmountOut = isToken0 ? amountIn * Number(price) : amountIn / Number(price);
    
    // Small fee deduction (0.3% default)
    rawAmountOut = rawAmountOut * 0.997;

    return rawAmountOut.toFixed(6);
  }, [tokenIn, tokenOut, amountInStr, price]);

  const priceImpact = 0.05; // Mock for now until we have liquidity depth

  return {
    amountOut,
    price,
    priceImpact,
    isLoading,
  };
}
