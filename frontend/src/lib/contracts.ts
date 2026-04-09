export const KORTANA_ROUTER_ADDRESS = "0x27ff10847E58030407D203409B5a0e3d167C38a1";
export const MDUSD_ADDRESS = "0x56D2AcEBD3B1b310A1f0B5c927421c4f26710E91";
export const WDNR_ADDRESS = "0x21Cf43Acc06Ef07B90B64e4eff68FE96Bc07eD87";
export const FACTORY_ADDRESS = "0x480bEEb78c3E6Bd6346bE36545f74C8AAC117206";

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
  }
];
