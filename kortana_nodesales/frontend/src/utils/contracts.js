import { ethers } from "ethers";
import { getActiveProvider } from "../store/useStore";

export const KORTANA_CHAIN_ID = 72511;

export const KORTANA_NETWORK = {
  chainId:          "0x11b3f",   // 72511 in hex
  chainName:        "Kortana Testnet",
  nativeCurrency:   { name: "DNR", symbol: "DNR", decimals: 18 },
  rpcUrls:          ["https://poseidon-rpc.testnet.kortana.xyz/"],
  blockExplorerUrls:["https://explorer.testnet.kortana.xyz"],
};

// ─── ABIs ────────────────────────────────────────────────────────────────────

export const NODE_SALE_ABI = [
  "function purchaseNode(uint256 tierId, uint256 quantity) external",
  "function getTier(uint256 tierId) external view returns (tuple(bytes32 name, uint256 priceUSDT, uint256 maxSupply, uint256 sold, uint256 dnrPerEpoch, uint256 licenseToken, uint256 active))",
  "function tiers(uint256) external view returns (bytes32 name, uint256 priceUSDT, uint256 maxSupply, uint256 sold, uint256 dnrPerEpoch, uint256 licenseToken, uint256 active)",
  "function remainingSupply(uint256 tierId) external view returns (uint256)",
  "function totalRaised() external view returns (uint256)",
  "event NodePurchased(address indexed buyer, uint256 indexed tierId, uint256 quantity, uint256 totalPaid, uint256 timestamp)",
];

export const REWARD_VAULT_ABI = [
  "function claimRewards() external",
  "function getPendingRewards(address user) external view returns (uint256)",
  "function getTotalEarned(address user) external view returns (uint256)",
  "function nextEpochTimestamp() external view returns (uint256)",
  "function currentEpoch() external view returns (uint256)",
  "event RewardsClaimed(address indexed user, uint256 amount, uint256 epoch, uint256 timestamp)",
];

export const ERC20_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function faucet(address to, uint256 amount) external",
];

// ─── Runtime config ───────────────────────────────────────────────────────────
// Addresses are served from /api/config (backend reads its own env vars).
// This works regardless of Vite build args.
// Hardcoded known testnet values are the guaranteed fallback.

const TESTNET_FALLBACK = {
  usdtAddress:        "0xE18cD71068Ed8dB03A5d19cE7eB232483F0F276C",
  nodeSaleAddress:    "0xdBA784A27D6B49325BF9c0ecB16350fB14fD9769",
  rewardVaultAddress: "0xCaA2D19d61605380703125EaC6E1a5018c12c88b",
  rpcUrl:             "https://poseidon-rpc.testnet.kortana.xyz/",
  explorerUrl:        "https://explorer.testnet.kortana.xyz",
  chainId:            72511,
};

let _config = null;   // null = not yet loaded; set to object once loaded

export async function getConfig() {
  if (_config) return _config;
  try {
    const API = import.meta.env.VITE_API_URL || "";
    const res  = await fetch(`${API}/api/config`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // Only cache if server returned a real USDT address
    if (data?.usdtAddress) {
      _config = data;
      return _config;
    }
  } catch (err) {
    console.warn("[Config] /api/config fetch failed, using hardcoded fallback:", err.message);
  }
  // Use hardcoded fallback — do NOT cache so next call retries API
  return TESTNET_FALLBACK;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function getProvider() {
  const raw = getActiveProvider();
  if (!raw) throw new Error("No wallet detected");
  const noop = () => {};
  const adapter = {
    request:        (args) => raw.request(args),
    on:             noop,
    off:            noop,
    addListener:    noop,
    removeListener: noop,
    emit:           noop,
  };
  return new ethers.BrowserProvider(adapter);
}

export async function getSigner() {
  return getProvider().getSigner();
}

// ─── Contract getters ─────────────────────────────────────────────────────────

export async function getNodeSaleContract(signerOrProvider) {
  const { nodeSaleAddress } = await getConfig();
  if (!nodeSaleAddress) throw new Error("Node sale address not configured");
  return new ethers.Contract(nodeSaleAddress, NODE_SALE_ABI, signerOrProvider);
}

export async function getRewardVaultContract(signerOrProvider) {
  const { rewardVaultAddress } = await getConfig();
  if (!rewardVaultAddress) throw new Error("Reward vault address not configured");
  return new ethers.Contract(rewardVaultAddress, REWARD_VAULT_ABI, signerOrProvider);
}

export async function getUSDTContract(signerOrProvider) {
  const { usdtAddress } = await getConfig();
  if (!usdtAddress) throw new Error("USDT address not configured");
  return new ethers.Contract(usdtAddress, ERC20_ABI, signerOrProvider);
}

// Always points to Kortana RPC — balance reads work regardless of which
// network the user's MetaMask is on.
export async function getKortanaReadProvider() {
  const { rpcUrl } = await getConfig();
  return new ethers.JsonRpcProvider(
    rpcUrl || "https://poseidon-rpc.testnet.kortana.xyz/"
  );
}

export async function switchToKortana() {
  const raw = getActiveProvider();
  if (!raw) return;
  if (raw.isKortana || raw.isKortanaWallet) return;
  try {
    await raw.request({ method: "wallet_switchEthereumChain", params: [{ chainId: KORTANA_NETWORK.chainId }] });
  } catch (err) {
    if (err.code === 4902 || err.code === -32603) {
      await raw.request({ method: "wallet_addEthereumChain", params: [KORTANA_NETWORK] });
    } else {
      throw err;
    }
  }
}

export function formatUSDT(raw) {
  return (Number(raw) / 1e6).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function formatDNR(raw) {
  return `${parseFloat(ethers.formatUnits(raw, 18)).toLocaleString()} DNR`;
}
