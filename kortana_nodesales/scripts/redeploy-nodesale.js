/**
 * Redeploy only NodeSale, reusing all existing deployed addresses.
 * Run when NodeSale.sol changes but licenses/vault are unchanged.
 *
 * Usage:
 *   npx hardhat run scripts/redeploy-nodesale.js --network kortana_testnet
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env.deployed") });
require("dotenv").config({ path: require("path").join(__dirname, "../.env"), override: false });

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

let _nonce = null;
async function getNonce(signer) {
  if (_nonce === null) _nonce = await signer.getNonce("pending");
  return _nonce++;
}

async function deployContract(factory, ...args) {
  const signer = await ethers.provider.getSigner();
  const nonce  = await getNonce(signer);
  const contract = await factory.deploy(...args, { gasLimit: 4_000_000, gasPrice: 1, nonce });
  await contract.waitForDeployment();
  return { contract, address: await contract.getAddress() };
}

async function sendTx(fn, ...args) {
  const signer = await ethers.provider.getSigner();
  const nonce  = await getNonce(signer);
  const tx = await fn(...args, { gasLimit: 200_000, gasPrice: 1, nonce });
  await tx.wait();
  return tx;
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

  // Deploy new NodeSale
  console.log("\nDeploying new NodeSale...");
  const NodeSale = await ethers.getContractFactory("NodeSale");
  const { address: nodeSaleAddress } = await deployContract(NodeSale, usdt, treasury, licenses);
  console.log(`  NodeSale: ${nodeSaleAddress}`);

  // Re-wire all 4 license contracts to point at the new NodeSale
  console.log("\nWiring licenses to new NodeSale...");
  const symbols = ["KGL", "KEL", "KFL", "KPL"];
  for (let i = 0; i < 4; i++) {
    const lic = await ethers.getContractAt("NodeLicense", licenses[i]);
    await sendTx(lic.setNodeSaleContract.bind(lic), nodeSaleAddress);
    console.log(`  ${symbols[i]} wired`);
  }

  // Update .env.deployed with new NodeSale address
  const deployed = fs.readFileSync(path.join(__dirname, "../.env.deployed"), "utf8");
  const updated  = deployed.replace(/NODE_SALE_ADDRESS=.*/, `NODE_SALE_ADDRESS=${nodeSaleAddress}`);
  fs.writeFileSync(path.join(__dirname, "../.env.deployed"), updated);
  console.log("\n.env.deployed updated");

  console.log("\n══════════════════════════════════════════════");
  console.log(" NodeSale REDEPLOYED");
  console.log(` New address: ${nodeSaleAddress}`);
  console.log("══════════════════════════════════════════════\n");
  console.log("Next steps:");
  console.log("  1. npm run inject          (updates backend/.env and frontend/.env)");
  console.log("  2. Update NODE_SALE_ADDRESS in Vercel dashboard");
  console.log("  3. git add frontend/.env.production && git push");
}

main().catch(err => { console.error(err); process.exit(1); });
