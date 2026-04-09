/**
 * Seed the initial DNR/mdUSD liquidity pool on Kortana Mainnet.
 *
 * Run ONCE after mainnet contract deployment:
 *   npx hardhat run scripts/seed_mainnet_pool.ts --network kortanaMainnet
 *
 * What this does:
 *   1. Mints mdUSD to the deployer (operator privilege)
 *   2. Approves the Router to spend mdUSD
 *   3. Calls addLiquidityDNR to seed the pool and set the initial price
 *   4. Prints the resulting pair address and reserves
 *
 * After this runs, users can swap DNR → mdUSD on the DEX to acquire tokens.
 * Adjust SEED_DNR and SEED_MDUSD below to set your desired initial price.
 * Price = SEED_MDUSD / SEED_DNR  (mdUSD per 1 DNR)
 */

import pkg from "hardhat";
const { ethers } = pkg;

// ─── Tune these before running ────────────────────────────────────────────────
// Set the amounts you want to seed. This establishes the initial market price.
// Example: 10 DNR + 1000 mdUSD → initial price of 100 mdUSD per DNR
const SEED_DNR   = ethers.parseEther("10");      // native DNR to deposit
const SEED_MDUSD = ethers.parseEther("1000");    // mdUSD to deposit

// Paste mainnet addresses here (output of deploy.ts --network kortanaMainnet)
const ROUTER_ADDRESS  = "";  // TODO
const MDUSD_ADDRESS   = "";  // TODO
const FACTORY_ADDRESS = "";  // TODO
// ──────────────────────────────────────────────────────────────────────────────

const ROUTER_ABI = [
  "function addLiquidityDNR(address token, uint amountTokenDesired, uint amountTokenMin, uint amountDNRMin, address to, uint deadline) payable returns (uint, uint, uint)",
  "function factory() view returns (address)",
];

const FACTORY_ABI = [
  "function getPair(address, address) view returns (address)",
];

const MDUSD_ABI = [
  "function mint(address to, uint256 amount) external",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function setOperator(address operator, bool status) external",
  "function isOperator(address) view returns (bool)",
];

async function main() {
  if (!ROUTER_ADDRESS || !MDUSD_ADDRESS || !FACTORY_ADDRESS) {
    throw new Error(
      "Fill in ROUTER_ADDRESS, MDUSD_ADDRESS, and FACTORY_ADDRESS at the top of this script first."
    );
  }

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("DNR balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  const mdUSD   = new ethers.Contract(MDUSD_ADDRESS, MDUSD_ABI, deployer);
  const router  = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, deployer);
  const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, deployer);

  // 1. Ensure deployer is operator and mint seed mdUSD
  const isOp = await mdUSD.isOperator(deployer.address);
  if (!isOp) {
    console.log("Setting deployer as mdUSD operator...");
    await (await mdUSD.setOperator(deployer.address, true)).wait();
  }

  console.log(`\nMinting ${ethers.formatEther(SEED_MDUSD)} mdUSD to deployer...`);
  await (await mdUSD.mint(deployer.address, SEED_MDUSD)).wait();
  console.log("mdUSD balance:", ethers.formatEther(await mdUSD.balanceOf(deployer.address)));

  // 2. Approve router to spend mdUSD
  console.log("\nApproving router to spend mdUSD...");
  await (await mdUSD.approve(ROUTER_ADDRESS, SEED_MDUSD)).wait();
  console.log("Approved.");

  // 3. Seed the pool (0.5 % slippage on both sides)
  const amountTokenMin = (SEED_MDUSD * 995n) / 1000n;
  const amountDNRMin   = (SEED_DNR   * 995n) / 1000n;
  const deadline       = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

  console.log(`\nSeeding pool: ${ethers.formatEther(SEED_DNR)} DNR + ${ethers.formatEther(SEED_MDUSD)} mdUSD`);
  console.log(`Initial price: 1 DNR = ${Number(SEED_MDUSD) / Number(SEED_DNR)} mdUSD`);

  const tx = await router.addLiquidityDNR(
    MDUSD_ADDRESS,
    SEED_MDUSD,
    amountTokenMin,
    amountDNRMin,
    deployer.address,
    deadline,
    { value: SEED_DNR }
  );
  const receipt = await tx.wait();
  console.log("Pool seeded! Tx:", receipt.hash);

  // 4. Print pair address for confirmation
  // We need WDNR address to look up the pair — read it from the router (or paste it)
  // For now just confirm via factory event or manually check explorer.
  console.log("\n✓ Pool is live. Users can now swap DNR → mdUSD on the DEX.");
  console.log("  Verify at: https://explorer.mainnet.kortana.xyz/tx/" + receipt.hash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
