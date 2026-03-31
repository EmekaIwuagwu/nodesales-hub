import { ethers } from "ethers";
import { getActiveProvider } from "../store/useStore";

export const KORTANA_CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || "9002");

export const KORTANA_NETWORK = {
  chainId:   `0x${KORTANA_CHAIN_ID.toString(16)}`,
  chainName: KORTANA_CHAIN_ID === 9002 ? "Kortana Mainnet" : "Kortana Testnet",
  nativeCurrency: { name: "DNR", symbol: "DNR", decimals: 18 },
  rpcUrls:     [import.meta.env.VITE_RPC_URL || "https://zeus-rpc.mainnet.kortana.xyz"],
  blockExplorerUrls: [import.meta.env.VITE_EXPLORER_URL || "https://explorer.mainnet.kortana.xyz"],
};

export const NODE_SALE_ABI = [
  "function purchaseNode(uint256 tierId, uint256 quantity) external",
  "function getTier(uint256 tierId) external view returns (tuple(string name, uint256 priceUSDT, uint256 maxSupply, uint256 sold, uint256 dnrPerEpoch, address licenseToken, bool active))",
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
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
];

export function getProvider() {
  // Use the specific provider the user logged in with (set in WalletModal).
  // This avoids the broken composite window.ethereum wrapper that MetaMask
  // creates when multiple wallet extensions are installed, which has a broken
  // internal event system ("this[#S].addListener is not a function").
  const raw = getActiveProvider();
  if (!raw) throw new Error("No wallet detected");

  // No-op event adapter: ethers v6 BrowserProvider calls provider.on() during
  // construction. For MetaMask this triggers broken internal addListener calls.
  // We only need request() to work — chain/account events are handled directly
  // in useWallet.js on the raw provider in the correct execution context.
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
  const provider = getProvider();
  return provider.getSigner();
}

export async function getNodeSaleContract(signerOrProvider) {
  const addr = import.meta.env.VITE_NODE_SALE_ADDRESS;
  if (!addr) throw new Error("VITE_NODE_SALE_ADDRESS not set");
  return new ethers.Contract(addr, NODE_SALE_ABI, signerOrProvider);
}

export async function getRewardVaultContract(signerOrProvider) {
  const addr = import.meta.env.VITE_REWARD_VAULT_ADDRESS;
  if (!addr) throw new Error("VITE_REWARD_VAULT_ADDRESS not set");
  return new ethers.Contract(addr, REWARD_VAULT_ABI, signerOrProvider);
}

export async function getUSDTContract(signerOrProvider) {
  const addr = import.meta.env.VITE_USDT_ADDRESS;
  if (!addr) throw new Error("VITE_USDT_ADDRESS not set");
  return new ethers.Contract(addr, ERC20_ABI, signerOrProvider);
}

/** Switch or add the Kortana network in MetaMask */
export async function switchToKortana() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: KORTANA_NETWORK.chainId }],
    });
  } catch (err) {
    if (err.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [KORTANA_NETWORK],
      });
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
