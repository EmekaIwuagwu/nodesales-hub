const { ethers } = require("ethers");
const logger     = require("../utils/logger");

let provider;
let rewardVault;
let nodeSale;

const REWARD_VAULT_ABI = [
  "function distributeRewards(address[] calldata recipients, uint256[] calldata amounts) external",
  "function getPendingRewards(address user) external view returns (uint256)",
  "function currentEpoch() external view returns (uint256)",
  "function nextEpochTimestamp() external view returns (uint256)",
  "function vaultBalance() external view returns (uint256)",
  "event RewardsDistributed(uint256 indexed epoch, uint256 totalRecipients, uint256 totalAmount, uint256 timestamp)",
  "event RewardsClaimed(address indexed user, uint256 amount, uint256 epoch, uint256 timestamp)",
];

const NODE_SALE_ABI = [
  "function getTier(uint256 tierId) external view returns (tuple(bytes32 name, uint256 priceUSDT, uint256 maxSupply, uint256 sold, uint256 dnrPerEpoch, uint256 licenseToken, uint256 active))",
  "function tiers(uint256) external view returns (bytes32 name, uint256 priceUSDT, uint256 maxSupply, uint256 sold, uint256 dnrPerEpoch, uint256 licenseToken, uint256 active)",
  "function totalRaised() external view returns (uint256)",
  "function remainingSupply(uint256 tierId) external view returns (uint256)",
  "event NodePurchased(address indexed buyer, uint256 indexed tierId, uint256 quantity, uint256 totalPaid, uint256 timestamp)",
];

function getProvider() {
  if (!process.env.KORTANA_RPC_URL) {
    throw new Error("KORTANA_RPC_URL not configured");
  }
  if (!provider) {
    provider = new ethers.JsonRpcProvider(process.env.KORTANA_RPC_URL);
  }
  return provider;
}

function getRewardVault() {
  if (!process.env.REWARD_VAULT_ADDRESS || !process.env.DISTRIBUTOR_PRIVATE_KEY) {
    throw new Error("REWARD_VAULT_ADDRESS or DISTRIBUTOR_PRIVATE_KEY not configured");
  }
  if (!rewardVault) {
    const signer = new ethers.Wallet(process.env.DISTRIBUTOR_PRIVATE_KEY, getProvider());
    rewardVault  = new ethers.Contract(process.env.REWARD_VAULT_ADDRESS, REWARD_VAULT_ABI, signer);
  }
  return rewardVault;
}

function getNodeSale() {
  if (!process.env.NODE_SALE_ADDRESS) {
    throw new Error("NODE_SALE_ADDRESS not configured");
  }
  if (!nodeSale) {
    nodeSale = new ethers.Contract(process.env.NODE_SALE_ADDRESS, NODE_SALE_ABI, getProvider());
  }
  return nodeSale;
}

function isBlockchainConfigured() {
  return !!(
    process.env.KORTANA_RPC_URL &&
    process.env.DISTRIBUTOR_PRIVATE_KEY &&
    process.env.DNR_ADDRESS
  );
}

module.exports = { getProvider, getRewardVault, getNodeSale, isBlockchainConfigured, NODE_SALE_ABI, REWARD_VAULT_ABI };
