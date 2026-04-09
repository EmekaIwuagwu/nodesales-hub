// ─── Contract addresses ───────────────────────────────────────────────────────
// Active addresses are selected by NEXT_PUBLIC_CHAIN_ID at build time.
// After mainnet deployment run `npx hardhat run scripts/deploy.ts --network kortanaMainnet`
// and fill in the MAINNET block below, then redeploy the frontend with
// NEXT_PUBLIC_CHAIN_ID=9002.

const TESTNET = {
  ROUTER:  "0x63D1e9919F972004067F4de9B8434b73B53860ae",
  MDUSD:   "0x371DeB6F2Bce2c9b3de001F4273b22A0abE03025",
  WDNR:    "0x352cE5ff75723216AABa5E153112c5A66A3F2392",
  FACTORY: "0x44b573dD1A58a9001056C711AC95c5830CDf840B",
};

// TODO: populate after mainnet deployment
const MAINNET = {
  ROUTER:  "" as string,
  MDUSD:   "" as string,
  WDNR:    "" as string,
  FACTORY: "" as string,
};

const ADDR =
  parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? "72511", 10) === 9002
    ? MAINNET
    : TESTNET;

export const KORTANA_ROUTER_ADDRESS = ADDR.ROUTER;
export const MDUSD_ADDRESS          = ADDR.MDUSD;
export const WDNR_ADDRESS           = ADDR.WDNR;
export const FACTORY_ADDRESS        = ADDR.FACTORY;

export const ROUTER_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "amountOutMin", type: "uint256" },
      { internalType: "address[]", name: "path", type: "address[]" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" }
    ],
    name: "swapExactDNRForTokens",
    outputs: [{ internalType: "uint256[]", name: "amounts", type: "uint256[]" }],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint256", name: "amountOutMin", type: "uint256" },
      { internalType: "address[]", name: "path", type: "address[]" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" }
    ],
    name: "swapExactTokensForDNR",
    outputs: [{ internalType: "uint256[]", name: "amounts", type: "uint256[]" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amountTokenDesired", type: "uint256" },
      { internalType: "uint256", name: "amountTokenMin", type: "uint256" },
      { internalType: "uint256", name: "amountDNRMin", type: "uint256" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" }
    ],
    name: "addLiquidityDNR",
    outputs: [
      { internalType: "uint256", name: "amountToken", type: "uint256" },
      { internalType: "uint256", name: "amountDNR", type: "uint256" },
      { internalType: "uint256", name: "liquidity", type: "uint256" }
    ],
    stateMutability: "payable",
    type: "function"
  },
  {
      inputs: [
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "liquidity", type: "uint256" },
          { internalType: "uint256", name: "amountTokenMin", type: "uint256" },
          { internalType: "uint256", name: "amountDNRMin", type: "uint256" },
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "deadline", type: "uint256" }
      ],
      name: "removeLiquidityDNR",
      outputs: [
          { internalType: "uint256", name: "amountToken", type: "uint256" },
          { internalType: "uint256", name: "amountDNR", type: "uint256" }
      ],
      stateMutability: "nonpayable",
      type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "address[]", name: "path", type: "address[]" }
    ],
    name: "getAmountsOut",
    outputs: [{ internalType: "uint256[]", name: "amounts", type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint256", name: "reserveIn", type: "uint256" },
      { internalType: "uint256", name: "reserveOut", type: "uint256" }
    ],
    name: "getAmountOut",
    outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
    stateMutability: "pure",
    type: "function"
  }
];

export const FACTORY_ABI = [
  {
      inputs: [
          { internalType: "address", name: "tokenA", type: "address" },
          { internalType: "address", name: "tokenB", type: "address" }
      ],
      name: "getPair",
      outputs: [{ internalType: "address", name: "pair", type: "address" }],
      stateMutability: "view",
      type: "function"
  }
];

export const PAIR_ABI = [
  {
      inputs: [],
      name: "getReserves",
      outputs: [
          { internalType: "uint112", name: "reserve0", type: "uint112" },
          { internalType: "uint112", name: "reserve1", type: "uint112" },
          { internalType: "uint32", name: "blockTimestampLast", type: "uint32" }
      ],
      stateMutability: "view",
      type: "function"
  },
  {
      inputs: [],
      name: "token0",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function"
  },
  {
      inputs: [],
      name: "token1",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      { "name": "_owner", "type": "address" },
      { "name": "_spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "remaining", "type": "uint256" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "name": "", "type": "uint256" }],
    "type": "function"
  }
];

export const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      { "name": "_owner", "type": "address" },
      { "name": "_spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "remaining", "type": "uint256" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{ "name": "", "type": "string" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "name": "", "type": "string" }],
    "type": "function"
  }
];
