/**
 * Kortana Node Sale — Deployment Script
 *
 * Deployment order:
 * 1. NodeLicense × 4 (one per tier)
 * 2. NodeSale     (passes all 4 license addresses)
 * 3. Wire NodeSale address into each NodeLicense
 * 4. RewardVault
 * 5. (Optional) Deposit initial DNR into vault
 *
 * Usage:
 *   npx hardhat run scripts/deploy.js --network kortana_testnet
 *   npx hardhat run scripts/deploy.js --network kortana_mainnet
 */

require("dotenv").config();
const { ethers, network } = require("hardhat");

// ─── Config ──────────────────────────────────────────────────────────────────

const CONFIG = {
  kortana_testnet: {
    usdt:        process.env.USDT_ADDRESS_TESTNET  || "0x0000000000000000000000000000000000000001",
    treasury:    process.env.TREASURY_TESTNET       || "0x0000000000000000000000000000000000000002",
    distributor: process.env.DISTRIBUTOR_TESTNET    || "0x0000000000000000000000000000000000000003",
    dnr:         process.env.DNR_ADDRESS_TESTNET    || "",   // leave blank to deploy MockDNR
    epochDuration: 2160, // 36 min testnet
  },
  kortana_mainnet: {
    usdt:        process.env.USDT_ADDRESS,
    treasury:    process.env.TREASURY,
    distributor: process.env.DISTRIBUTOR_ADDRESS,
    dnr:         process.env.DNR_ADDRESS,
    epochDuration: 86400, // 24 h mainnet
  },
  hardhat: {
    usdt:        "",
    treasury:    "",
    distributor: "",
    dnr:         "",
    epochDuration: 300,  // 5 min local
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(msg) {
  console.log(`[deploy] ${msg}`);
}

// Shared nonce counter — prevents RlpIsTooBig from stale mempool nonces
let _nonce = null;
async function getNonce(signer) {
  if (_nonce === null) {
    _nonce = await signer.getNonce("pending");
  }
  return _nonce++;
}

async function deployContract(factory, ...args) {
  const signer = await ethers.provider.getSigner();
  const nonce  = await getNonce(signer);
  const contract = await factory.deploy(...args, { gasLimit: 4_000_000, gasPrice: 1, nonce });
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  return { contract, address };
}

async function sendTx(contractFn, ...args) {
  const signer = await ethers.provider.getSigner();
  const nonce  = await getNonce(signer);
  const tx     = await contractFn(...args, { gasLimit: 200_000, gasPrice: 1, nonce });
  await tx.wait();
  return tx;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const [deployer] = await ethers.getSigners();
  const net = network.name;
  const cfg = CONFIG[net] || CONFIG.hardhat;

  log(`Network:  ${net}`);
  log(`Deployer: ${deployer.address}`);
  log(`Balance:  ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} DNR`);

  // 0. Deploy MockUSDT / MockDNR if addresses not set (testnet/local)
  let usdtAddress = cfg.usdt;
  let dnrAddress  = cfg.dnr;

  if (!usdtAddress || usdtAddress.startsWith("0x000")) {
    log("Deploying MockUSDT...");
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const { address } = await deployContract(MockUSDT);
    usdtAddress = address;
    log(`  MockUSDT: ${usdtAddress}`);
  }

  if (!dnrAddress || dnrAddress.startsWith("0x000")) {
    log("Deploying MockDNR...");
    const MockDNR = await ethers.getContractFactory("MockDNR");
    const { address } = await deployContract(MockDNR);
    dnrAddress = address;
    log(`  MockDNR: ${dnrAddress}`);
  }

  let treasury    = cfg.treasury;
  let distributor = cfg.distributor;
  if (!treasury    || treasury.startsWith("0x000"))    treasury    = deployer.address;
  if (!distributor || distributor.startsWith("0x000")) distributor = deployer.address;

  // 1. Deploy 4× NodeLicense
  log("\nDeploying NodeLicense contracts...");
  const NodeLicense = await ethers.getContractFactory("NodeLicense");

  const tiers = [
    { name: "Kortana Genesis License", symbol: "KGL", supply: 1000, id: 0 },
    { name: "Kortana Early License",   symbol: "KEL", supply: 2000, id: 1 },
    { name: "Kortana Full License",    symbol: "KFL", supply: 1000, id: 2 },
    { name: "Kortana Premium License", symbol: "KPL", supply: 500,  id: 3 },
  ];

  const licenseAddresses = [];
  for (const tier of tiers) {
    const { address } = await deployContract(NodeLicense, tier.name, tier.symbol, tier.supply, tier.id);
    licenseAddresses.push(address);
    log(`  ${tier.symbol}: ${address}`);
  }

  // 2. Deploy NodeSale
  log("\nDeploying NodeSale...");
  const NodeSale = await ethers.getContractFactory("NodeSale");
  const { contract: nodeSale, address: nodeSaleAddress } = await deployContract(
    NodeSale,
    usdtAddress,
    treasury,
    licenseAddresses
  );
  log(`  NodeSale: ${nodeSaleAddress}`);

  // 3. Wire NodeSale into each license contract
  log("\nWiring NodeSale into license contracts...");
  for (let i = 0; i < 4; i++) {
    const lic = await ethers.getContractAt("NodeLicense", licenseAddresses[i]);
    await sendTx(lic.setNodeSaleContract.bind(lic), nodeSaleAddress);
    log(`  ${tiers[i].symbol} → nodeSale set`);
  }

  // 4. Deploy RewardVault
  log("\nDeploying RewardVault...");
  const RewardVault = await ethers.getContractFactory("RewardVault");
  const { contract: vault, address: vaultAddress } = await deployContract(
    RewardVault,
    dnrAddress,
    distributor,
    cfg.epochDuration
  );
  log(`  RewardVault: ${vaultAddress}`);

  // 5. Vault deposit skipped — run scripts/fund-vault.js after deployment
  //    to deposit initial DNR rewards into the RewardVault.

  // ─── Summary ─────────────────────────────────────────────────────────────

  console.log("\n══════════════════════════════════════════════");
  console.log(" DEPLOYMENT COMPLETE");
  console.log("══════════════════════════════════════════════");
  console.log(`Network:       ${net}`);
  console.log(`USDT:          ${usdtAddress}`);
  console.log(`DNR:           ${dnrAddress}`);
  console.log(`Treasury:      ${treasury}`);
  console.log(`Distributor:   ${distributor}`);
  console.log("────────────────────────────────────────────");
  console.log(`KGL (Genesis): ${licenseAddresses[0]}`);
  console.log(`KEL (Early):   ${licenseAddresses[1]}`);
  console.log(`KFL (Full):    ${licenseAddresses[2]}`);
  console.log(`KPL (Premium): ${licenseAddresses[3]}`);
  console.log(`NodeSale:      ${nodeSaleAddress}`);
  console.log(`RewardVault:   ${vaultAddress}`);
  console.log("══════════════════════════════════════════════\n");

  // Write addresses to .env.deployed for backend pickup
  const fs = require("fs");
  const envContent = `
# Auto-generated by deploy.js — ${new Date().toISOString()}
NETWORK=${net}
USDT_ADDRESS=${usdtAddress}
DNR_ADDRESS=${dnrAddress}
TREASURY=${treasury}
DISTRIBUTOR_ADDRESS=${distributor}
GENESIS_LICENSE_ADDRESS=${licenseAddresses[0]}
EARLY_LICENSE_ADDRESS=${licenseAddresses[1]}
FULL_LICENSE_ADDRESS=${licenseAddresses[2]}
PREMIUM_LICENSE_ADDRESS=${licenseAddresses[3]}
NODE_SALE_ADDRESS=${nodeSaleAddress}
REWARD_VAULT_ADDRESS=${vaultAddress}
`;
  fs.writeFileSync(".env.deployed", envContent.trim());
  log("Addresses saved to .env.deployed");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
