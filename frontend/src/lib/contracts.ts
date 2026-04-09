// ─── Contract addresses ───────────────────────────────────────────────────────
//
// KortanaMonoDEX is a single contract that combines:
//   - mdUSD ERC-20 token
//   - KLP LP token
//   - mdUSD/DNR AMM pool
//
// Kortana EVM limitations that drove this design:
//   1. No contract-to-contract CALL (any outgoing call from within a tx uses all gas)
//   2. Prohibitive gas for 256-bit MUL (>128-bit products)  →  internal 1e9 scaling

const TESTNET_DEX = "0xA7b11655DeE84cF8BEE727fFf7539d6D300212e3";

const TESTNET = {
  DEX:    TESTNET_DEX,
  // Legacy aliases (kept so faucet route and swap page don't break immediately)
  ROUTER:  TESTNET_DEX,
  MDUSD:   TESTNET_DEX,
  FACTORY: TESTNET_DEX,
  WDNR:    "0x352cE5ff75723216AABa5E153112c5A66A3F2392", // WDNR still exists but no longer needed for pool
};

const MAINNET = {
  DEX:    "" as string,
  ROUTER:  "" as string,
  MDUSD:   "" as string,
  FACTORY: "" as string,
  WDNR:    "" as string,
};

const ADDR =
  parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? "72511", 10) === 9002
    ? MAINNET
    : TESTNET;

export const DEX_ADDRESS             = ADDR.DEX;
export const KORTANA_ROUTER_ADDRESS  = ADDR.ROUTER;  // same as DEX
export const MDUSD_ADDRESS           = ADDR.MDUSD;   // same as DEX
export const FACTORY_ADDRESS         = ADDR.FACTORY; // same as DEX
export const WDNR_ADDRESS            = ADDR.WDNR;

// ─── KortanaMonoDEX ABI ───────────────────────────────────────────────────────

export const DEX_ABI = [
  // ── mdUSD ERC-20 ──
  {
    name: "balanceOf",
    type: "function", stateMutability: "view",
    inputs:  [{ name: "a",       type: "address" }],
    outputs: [{ name: "",        type: "uint256" }],
  },
  {
    name: "totalSupply",
    type: "function", stateMutability: "view",
    inputs:  [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "allowance",
    type: "function", stateMutability: "view",
    inputs:  [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    outputs: [{ name: "",      type: "uint256" }],
  },
  {
    name: "approve",
    type: "function", stateMutability: "nonpayable",
    inputs:  [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "transfer",
    type: "function", stateMutability: "nonpayable",
    inputs:  [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "transferFrom",
    type: "function", stateMutability: "nonpayable",
    inputs:  [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "mint",
    type: "function", stateMutability: "nonpayable",
    inputs:  [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    name: "name",
    type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "string" }],
  },
  {
    name: "symbol",
    type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "string" }],
  },
  {
    name: "decimals",
    type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint8" }],
  },
  // ── LP token ──
  {
    name: "lpBalanceOf",
    type: "function", stateMutability: "view",
    inputs:  [{ name: "a", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "lpTotalSupply",
    type: "function", stateMutability: "view",
    inputs:  [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "lpTransfer",
    type: "function", stateMutability: "nonpayable",
    inputs:  [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  // ── AMM ──
  {
    name: "getReserves",
    type: "function", stateMutability: "view",
    inputs:  [],
    outputs: [{ name: "rMDUSD", type: "uint256" }, { name: "rDNR", type: "uint256" }],
  },
  {
    name: "getAmountOut",
    type: "function", stateMutability: "view",
    inputs:  [{ name: "amountIn", type: "uint256" }, { name: "dnrIn", type: "bool" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "addLiquidity",
    type: "function", stateMutability: "payable",
    inputs: [
      { name: "amountMDUSD", type: "uint256" },
      { name: "minMDUSD",    type: "uint256" },
      { name: "minDNR",      type: "uint256" },
      { name: "to",          type: "address" },
    ],
    outputs: [
      { name: "usedMDUSD18", type: "uint256" },
      { name: "usedDNR18",   type: "uint256" },
      { name: "lp18",        type: "uint256" },
    ],
  },
  {
    name: "removeLiquidity",
    type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "lpAmount", type: "uint256" },
      { name: "minMDUSD", type: "uint256" },
      { name: "minDNR",   type: "uint256" },
      { name: "to",       type: "address" },
    ],
    outputs: [
      { name: "outMDUSD18", type: "uint256" },
      { name: "outDNR18",   type: "uint256" },
    ],
  },
  {
    name: "swapExactDNRForMDUSD",
    type: "function", stateMutability: "payable",
    inputs:  [{ name: "minOut", type: "uint256" }, { name: "to", type: "address" }],
    outputs: [{ name: "amountOut18", type: "uint256" }],
  },
  {
    name: "swapExactMDUSDForDNR",
    type: "function", stateMutability: "nonpayable",
    inputs:  [{ name: "amountIn", type: "uint256" }, { name: "minOut", type: "uint256" }, { name: "to", type: "address" }],
    outputs: [{ name: "amountOut18", type: "uint256" }],
  },
] as const;

// ─── Legacy ABIs (kept for Swap page compatibility) ───────────────────────────

export const ROUTER_ABI = DEX_ABI;
export const FACTORY_ABI = DEX_ABI;
export const PAIR_ABI = DEX_ABI;
export const ERC20_ABI = DEX_ABI;
