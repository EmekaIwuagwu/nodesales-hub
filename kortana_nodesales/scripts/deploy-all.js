/**
 * Full redeploy: NodeLicense × 4
 *
 * Kortana EVM: contract-to-contract CALL is broken.
 * Architecture: user pays USDT directly to treasury (EOA→ERC20),
 * backend verifies and mints license (EOA→NodeLicense).
 * No contract ever calls another contract.
 *
 * Usage:
 *   npx hardhat run scripts/deploy-all.js --network kortana_testnet
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

async function deploy(factory, ...args) {
  const signer = await ethers.provider.getSigner();
  const nonce  = await getNonce(signer);
  const c = await factory.deploy(...args, { gasLimit: 3_000_000, gasPrice: 1, nonce });
  await c.waitForDeployment();
  return { contract: c, address: await c.getAddress() };
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer:    ${deployer.address}`);
  console.log(`Balance:     ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} DNR\n`);

  const distributor = process.env.DISTRIBUTOR_ADDRESS || deployer.address;
  console.log(`Distributor (minter): ${distributor}`);

  // ── Deploy 4 NodeLicense contracts ──────────────────────────────────────────
  console.log("\n── Deploying NodeLicense contracts ──────────────────────────────");
  const NodeLicense = await ethers.getContractFactory("NodeLicense");

  const LICENSES = [
    { name: "Kortana Genesis License", symbol: "KGL", supply: 1000, tierId: 0 },
    { name: "Kortana Early License",   symbol: "KEL", supply: 2000, tierId: 1 },
    { name: "Kortana Full License",    symbol: "KFL", supply: 1000, tierId: 2 },
    { name: "Kortana Premium License", symbol: "KPL", supply: 500,  tierId: 3 },
  ];

  const licAddresses = [];
  for (const l of LICENSES) {
    const { address } = await deploy(NodeLicense, l.name, l.symbol, l.supply, l.tierId, distributor);
    licAddresses.push(address);
    console.log(`  ${l.symbol}: ${address}`);
  }

  // ── Verify minter is set correctly ──────────────────────────────────────────
  console.log("\n── Verifying ───────────────────────────────────────────────────");
  const LIC_ABI = ["function minter() external view returns (address)","function maxSupply() external view returns (uint256)","function tierId() external view returns (uint8)"];
  for (let i = 0; i < LICENSES.length; i++) {
    const lic = new ethers.Contract(licAddresses[i], LIC_ABI, ethers.provider);
    const m   = await lic.minter();
    const ok  = m.toLowerCase() === distributor.toLowerCase();
    console.log(`  ${LICENSES[i].symbol}: minter=${m} ${ok ? "✓" : "✗ WRONG"}`);
    if (!ok) throw new Error(`${LICENSES[i].symbol} minter wrong`);
  }

  // ── Test mint from distributor ───────────────────────────────────────────────
  console.log("\n── Testing mint() from distributor EOA ─────────────────────────");
  const LIC_MINT_ABI = ["function mint(address,uint256) external","function balanceOf(address) external view returns (uint256)","function totalMinted() external view returns (uint256)"];
  const kgl     = new ethers.Contract(licAddresses[0], LIC_MINT_ABI, deployer);
  const nonce   = await getNonce(deployer);
  const testAddr = deployer.address;

  try {
    const tx  = await kgl.mint(testAddr, 1, { gasLimit: 300_000, gasPrice: 1, nonce });
    const rec = await tx.wait();
    const bal = await kgl.balanceOf(testAddr);
    console.log(`  gasUsed: ${rec.gasUsed}  KGL balance of deployer: ${bal} ${bal >= 1n ? "✓" : "✗"}`);
    if (bal < 1n) throw new Error("Mint did not change balance!");
    console.log("  Mint from EOA WORKS ✓");
  } catch(e) {
    console.error("  Mint test FAILED:", e.reason || e.message?.slice(0,200));
    process.exit(1);
  }

  // ── Update .env.deployed ─────────────────────────────────────────────────────
  const envPath    = path.join(__dirname, "../.env.deployed");
  let   envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

  function upsertEnv(content, key, value) {
    const re = new RegExp(`^${key}=.*`, "m");
    return re.test(content) ? content.replace(re, `${key}=${value}`) : content + `\n${key}=${value}`;
  }

  envContent = upsertEnv(envContent, "GENESIS_LICENSE_ADDRESS", licAddresses[0]);
  envContent = upsertEnv(envContent, "EARLY_LICENSE_ADDRESS",   licAddresses[1]);
  envContent = upsertEnv(envContent, "FULL_LICENSE_ADDRESS",    licAddresses[2]);
  envContent = upsertEnv(envContent, "PREMIUM_LICENSE_ADDRESS", licAddresses[3]);
  fs.writeFileSync(envPath, envContent);
  console.log("\n  .env.deployed updated ✓");

  // ── Summary ──────────────────────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════════════════════════════");
  console.log(" DEPLOY COMPLETE — MINT FROM EOA VERIFIED");
  console.log("══════════════════════════════════════════════════════════════════");
  console.log(` KGL: ${licAddresses[0]}`);
  console.log(` KEL: ${licAddresses[1]}`);
  console.log(` KFL: ${licAddresses[2]}`);
  console.log(` KPL: ${licAddresses[3]}`);
  console.log(`\n Minter (distributor): ${distributor}`);
  console.log("\nNext:");
  console.log("  npm run inject   — bakes addresses into frontend/.env.production");
  console.log("  Update Vercel env vars");
  console.log("  git push");
}

main().catch(err => { console.error(err); process.exit(1); });
