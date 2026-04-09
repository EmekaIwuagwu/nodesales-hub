/**
 * fund_faucet.ts — run this ONCE locally to stock the faucet wallet with mdUSD.
 *
 * Usage:
 *   npx hardhat run scripts/fund_faucet.ts --network kortanaTestnet
 *
 * What it does:
 *   1. Reads the deployer from PRIVATE_KEY in .env
 *   2. Prints contract state (owner, operators, balances)
 *   3. If deployer is owner → sets deployer as operator if needed
 *   4. Mints MINT_AMOUNT mdUSD directly to the deployer wallet
 *
 * After this runs the faucet API can simply transfer() from the deployer
 * wallet — no minting or operator logic needed at request time.
 */

import pkg from "hardhat";
const { ethers } = pkg;

const MDUSD_ADDRESS = "0xEA492aA6e52E9202d2f377C2FD16395cb4A2D7B8";
const MINT_AMOUNT   = ethers.parseEther("1000000"); // 1 million mdUSD stockpile

const ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function owner() view returns (address)",
  "function isOperator(address) view returns (bool)",
  "function totalSupply() view returns (uint256)",
  "function cap() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function setOperator(address operator, bool status) external",
  "function mint(address to, uint256 amount) external",
];

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("\n=== fund_faucet.ts ===");
  console.log("Deployer address :", deployer.address);
  console.log("DNR balance      :", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  const mdUSD = new ethers.Contract(MDUSD_ADDRESS, ABI, deployer);

  // ── Print contract state ──────────────────────────────────────────────────
  const [name, symbol, owner, isOp, supply, cap, balance] = await Promise.all([
    mdUSD.name(),
    mdUSD.symbol(),
    mdUSD.owner(),
    mdUSD.isOperator(deployer.address),
    mdUSD.totalSupply(),
    mdUSD.cap(),
    mdUSD.balanceOf(deployer.address),
  ]);

  console.log("\n── mdUSD contract state ──");
  console.log("Name        :", name);
  console.log("Symbol      :", symbol);
  console.log("Owner       :", owner);
  console.log("Cap         :", ethers.formatEther(cap));
  console.log("Total supply:", ethers.formatEther(supply));
  console.log("Deployer balance:", ethers.formatEther(balance));
  console.log("Deployer is operator:", isOp);
  console.log("Deployer is owner   :", owner.toLowerCase() === deployer.address.toLowerCase());

  // ── Register operator if needed ───────────────────────────────────────────
  const isOwner = owner.toLowerCase() === deployer.address.toLowerCase();

  if (!isOp) {
    if (!isOwner) {
      console.error(
        "\n❌  Deployer is neither owner nor operator.",
        "\n    Owner :", owner,
        "\n    You   :", deployer.address,
        "\n    Make sure PRIVATE_KEY in .env matches the address that deployed the contracts."
      );
      process.exit(1);
    }
    console.log("\nRegistering deployer as operator...");
    const tx = await mdUSD.setOperator(deployer.address, true);
    await tx.wait();
    console.log("✓ Operator set.");
  }

  // ── Mint stock to deployer ────────────────────────────────────────────────
  console.log(`\nMinting ${ethers.formatEther(MINT_AMOUNT)} mdUSD to deployer...`);
  const mintTx = await mdUSD.mint(deployer.address, MINT_AMOUNT);
  await mintTx.wait();

  const newBalance = await mdUSD.balanceOf(deployer.address);
  console.log("✓ Done. Deployer mdUSD balance:", ethers.formatEther(newBalance));
  console.log("\nThe faucet API will now transfer() from this wallet.");
  console.log("No further minting needed until balance runs low.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
