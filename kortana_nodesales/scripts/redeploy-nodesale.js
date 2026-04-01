/**
 * Redeploy only NodeSale, reusing all existing deployed addresses.
 * Constructor is now minimal — tiers are initialized via initTier() calls
 * so each write gets its own tx with explicit gasLimit (Kortana testnet
 * eth_estimateGas always returns 21576 which is insufficient for storage writes).
 *
 * Usage:
 *   npx hardhat run scripts/redeploy-nodesale.js --network kortana_testnet
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env.deployed") });
require("dotenv").config({ path: require("path").join(__dirname, "../.env"), override: false });

const { ethers } = require("hardhat");
const fs   = require("fs");
const path = require("path");

let _nonce = null;
async function getNonce(signer) {
  if (_nonce === null) _nonce = await signer.getNonce("pending");
  return _nonce++;
}

async function deployContract(factory, ...args) {
  const signer = await ethers.provider.getSigner();
  const nonce  = await getNonce(signer);
  const c = await factory.deploy(...args, { gasLimit: 3_000_000, gasPrice: 1, nonce });
  await c.waitForDeployment();
  return { contract: c, address: await c.getAddress() };
}

async function sendTx(fn, ...args) {
  const signer = await ethers.provider.getSigner();
  const nonce  = await getNonce(signer);
  const tx = await fn(...args, { gasLimit: 300_000, gasPrice: 1, nonce });
  await tx.wait();
  return tx;
}

// Convert string to bytes32
function toBytes32(str) {
  return ethers.encodeBytes32String(str);
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance:  ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} DNR\n`);

  const usdt     = process.env.USDT_ADDRESS;
  const treasury = process.env.TREASURY || deployer.address;
  const licenses = [
    process.env.GENESIS_LICENSE_ADDRESS,
    process.env.EARLY_LICENSE_ADDRESS,
    process.env.FULL_LICENSE_ADDRESS,
    process.env.PREMIUM_LICENSE_ADDRESS,
  ];

  console.log("Reusing addresses:");
  console.log(`  USDT:     ${usdt}`);
  console.log(`  Treasury: ${treasury}`);
  licenses.forEach((a, i) => console.log(`  License[${i}]: ${a}`));

  // 1 — Deploy NodeSale with minimal constructor (just usdt + treasury)
  console.log("\nDeploying NodeSale...");
  const NodeSale = await ethers.getContractFactory("NodeSale");
  const { contract: sale, address: nodeSaleAddress } = await deployContract(NodeSale, usdt, treasury);
  console.log(`  NodeSale: ${nodeSaleAddress}`);

  // 2 — Initialize each tier separately (one tx per tier, explicit gasLimit)
  console.log("\nInitializing tiers...");
  const TIERS = [
    { id: 0, name: "Genesis", price: 300n * 1_000_000n,  supply: 1000, dnr: 1n  * 10n**18n },
    { id: 1, name: "Early",   price: 500n * 1_000_000n,  supply: 2000, dnr: 2n  * 10n**18n },
    { id: 2, name: "Full",    price: 1000n * 1_000_000n, supply: 1000, dnr: 5n  * 10n**18n },
    { id: 3, name: "Premium", price: 2000n * 1_000_000n, supply: 500,  dnr: 10n * 10n**18n },
  ];
  for (const t of TIERS) {
    await sendTx(sale.initTier.bind(sale), t.id, toBytes32(t.name), t.price, t.supply, t.dnr, licenses[t.id]);
    console.log(`  Tier ${t.id} (${t.name}) initialized`);
  }

  // 3 — Wire all 4 license contracts to the new NodeSale
  console.log("\nWiring licenses to new NodeSale...");
  const symbols = ["KGL", "KEL", "KFL", "KPL"];
  for (let i = 0; i < 4; i++) {
    const lic = await ethers.getContractAt("NodeLicense", licenses[i]);
    await sendTx(lic.setNodeSaleContract.bind(lic), nodeSaleAddress);
    console.log(`  ${symbols[i]} wired`);
  }

  // 4 — Verify on-chain
  console.log("\nVerifying...");
  for (const t of TIERS) {
    const stored = await sale.tiers(t.id);
    // active and licenseToken are uint256 in the new contract
    const activeOk  = stored.active === 1n || stored.active.toString() === "1";
    const licenseOk = BigInt(stored.licenseToken) === BigInt(licenses[t.id]);
    console.log(`  Tier ${t.id}: active=${stored.active} license=0x${BigInt(stored.licenseToken).toString(16).padStart(40,'0')}`);
    if (!activeOk)  throw new Error(`Tier ${t.id} not active after init!`);
    if (!licenseOk) throw new Error(`Tier ${t.id} wrong license address!`);
  }
  console.log("  All tiers verified ✓");

  // 5 — Update .env.deployed
  const deployed = fs.readFileSync(path.join(__dirname, "../.env.deployed"), "utf8");
  const updated  = deployed.replace(/NODE_SALE_ADDRESS=.*/, `NODE_SALE_ADDRESS=${nodeSaleAddress}`);
  fs.writeFileSync(path.join(__dirname, "../.env.deployed"), updated);

  console.log("\n══════════════════════════════════════════════");
  console.log(" NodeSale REDEPLOYED & VERIFIED");
  console.log(` New address: ${nodeSaleAddress}`);
  console.log("══════════════════════════════════════════════");
  console.log("Next: npm run inject && git push");
}

main().catch(err => { console.error(err); process.exit(1); });
