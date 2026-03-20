export const NETWORKS = {
  KORTANA_TESTNET: {
    chainId: 72511,
    rpcUrl: "https://poseidon-rpc.testnet.kortana.xyz/",
    explorer: "https://explorer.testnet.kortana.xyz",
    symbol: "DNR",
    dnrs: "0xa1E9679c7AE524a09AbE34464A99d8D5daaEA92B",
    boardroom: "0x216E22FbBC3f891B38434bC92F3512B55Fd02C3f"
  },
  KORTANA_MAINNET: {
    chainId: 9002,
    rpcUrl: "https://zeus-rpc.mainnet.kortana.xyz",
    explorer: "https://explorer.mainnet.kortana.xyz",
    symbol: "DNR",
    dnrs: "0x0000000000000000000000000000000000000000",
    boardroom: "0x0000000000000000000000000000000000000000"
  }
};

export const DNRS_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount) external",
  "function burn(uint256 amount) external",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)"
];

export const BOARDROOM_ABI = [
  "function stake(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function claimReward() external",
  "function pendingRewards(address account) view returns (uint256)",
  "function stakedBalanceOf(address account) view returns (uint256)"
];
