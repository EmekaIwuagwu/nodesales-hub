import { ethers } from "ethers";
import { getActiveProvider } from "../store/useStore";

// Chain ID — hardcoded fallback, overridden by /api/config at runtime
export const KORTANA_CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || "72511");

export const KORTANA_NETWORK = {
  chainId:   `0x${KORTANA_CHAIN_ID.toString(16)}`,
  chainName: KORTANA_CHAIN_ID === 9002 ? "Kortana Mainnet" : "Kortana Testnet",
  nativeCurrency: { name: "DNR", symbol: "DNR", decimals: 18 },
  rpcUrls:          [import.meta.env.VITE_RPC_URL || "https://poseidon-rpc.testnet.kortana.xyz/"],
  blockExplorerUrls:[import.meta.env.VITE_EXPLORER_URL || "https://explorer.testnet.kortana.xyz"],
};

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

// ─── Runtime config fetched from /api/config ─────────────────────────────────
// Addresses come from backend env vars, not from VITE_ build args.
// This means no Docker rebuild is needed when addresses change.

let _config = null;

export async function getConfig() {
  if (_config) return _config;
  try {
    const API = import.meta.env.VITE_API_URL || "";
    const res = await fetch(`${API}/api/config`);
    _config = await res.json();
  } catch {
    // Fallback to VITE_ build-time vars if API unreachable
    _config = {
      usdtAddress:        import.meta.env.VITE_USDT_ADDRESS        || "",
      nodeSaleAddress:    import.meta.env.VITE_NODE_SALE_ADDRESS    || "",
      rewardVaultAddress: import.meta.env.VITE_REWARD_VAULT_ADDRESS || "",
      rpcUrl:             import.meta.env.VITE_RPC_URL              || "https://poseidon-rpc.testnet.kortana.xyz/",
      explorerUrl:        import.meta.env.VITE_EXPLORER_URL         || "https://explorer.testnet.kortana.xyz",
    };
  }
  return _config;
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

// ─── Contract getters (use runtime config) ────────────────────────────────────

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

// Read-only provider always on Kortana RPC — balance reads work regardless of
// which network the user's MetaMask is currently set to.
export async function getKortanaReadProvider() {
  const { rpcUrl } = await getConfig();
  return new ethers.JsonRpcProvider(rpcUrl || "https://poseidon-rpc.testnet.kortana.xyz/");
}

/** Switch MetaMask to Kortana network */
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
