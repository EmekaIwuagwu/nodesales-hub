/**
 * fund-vault.js
 *
 * Deposits 1M MockDNR into the RewardVault using raw ethers (no Hardhat).
 * Run once after deploy.js on testnet.
 *
 * Usage:
 *   node scripts/fund-vault.js
 */

require("dotenv").config({ path: ".env.deployed" });
require("dotenv").config({ override: false });

const { ethers } = require("ethers");

const MOCK_DNR_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function faucet(address to, uint256 amount) external",
  "function allowance(address owner, address spender) external view returns (uint256)",
];
const VAULT_ABI = [
  "function depositRewards(uint256 amount) external",
  "function vaultBalance() external view returns (uint256)",
  "function owner() external view returns (address)",
];

async function main() {
  const RPC_URL    = process.env.KORTANA_RPC_URL    || "https://poseidon-rpc.testnet.kortana.xyz/";
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const dnrAddress  = process.env.DNR_ADDRESS;
  const vaultAddress = process.env.REWARD_VAULT_ADDRESS;

  if (!PRIVATE_KEY || !dnrAddress || !vaultAddress) {
    console.error("Missing PRIVATE_KEY, DNR_ADDRESS, or REWARD_VAULT_ADDRESS");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer   = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log(`Funding vault`);
  console.log(`  Signer:      ${signer.address}`);
  console.log(`  MockDNR:     ${dnrAddress}`);
  console.log(`  RewardVault: ${vaultAddress}`);
  console.log(`  RPC:         ${RPC_URL}`);

  const dnr   = new ethers.Contract(dnrAddress,   MOCK_DNR_ABI, signer);
  const vault = new ethers.Contract(vaultAddress, VAULT_ABI,    signer);

  const amount = ethers.parseUnits("1000000", 18);

  // Check current DNR balance
  const bal = await dnr.balanceOf(signer.address);
  console.log(`\n  DNR balance: ${ethers.formatUnits(bal, 18)}`);

  if (bal < amount) {
    console.log("  Minting via faucet...");
    const tx = await dnr.faucet(signer.address, amount);
    await tx.wait();
    console.log("  Minted.");
  }

  // Check allowance
  const allowance = await dnr.allowance(signer.address, vaultAddress);
  if (allowance < amount) {
    console.log("  Approving vault...");
    const tx = await dnr.approve(vaultAddress, amount);
    await tx.wait();
    console.log("  Approved.");
  } else {
    console.log("  Allowance already sufficient.");
  }

  // Deposit
  console.log("  Depositing 1M DNR into vault...");
  const tx = await vault.depositRewards(amount);
  console.log(`  Tx: ${tx.hash}`);
  await tx.wait();
  console.log("  Deposited.");

  const vaultBal = await vault.vaultBalance();
  console.log(`\n  Vault balance: ${ethers.formatUnits(vaultBal, 18)} DNR`);
  console.log("\nDone.");
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
