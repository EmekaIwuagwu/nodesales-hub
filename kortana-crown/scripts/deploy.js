// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "BNB");

  const TREASURY  = process.env.TREASURY_ADDRESS;
  const BRIDGE    = process.env.BRIDGE_OPERATOR_ADDRESS;

  if (!ethers.isAddress(TREASURY) || !ethers.isAddress(BRIDGE)) {
    throw new Error("Set TREASURY_ADDRESS and BRIDGE_OPERATOR_ADDRESS in .env");
  }

  console.log("\nDeploying KortanaCrown...");
  const KortanaCrown = await ethers.getContractFactory("KortanaCrown");
  const token = await KortanaCrown.deploy(TREASURY, BRIDGE);
  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log("wKUD deployed to:", address);

  // Verify total supply
  const supply = await token.totalSupply();
  console.log("Total Supply:", ethers.formatUnits(supply, 18), "wKUD");
  console.log("Supply matches 250M:", supply === 250_000_000n * 10n ** 18n);

  // Post-deploy: transfer supply to treasury
  console.log("\nTransferring supply to treasury...");
  const tx = await token.transfer(TREASURY, supply);
  await tx.wait();
  console.log("Treasury balance:", ethers.formatUnits(await token.balanceOf(TREASURY), 18));

  // Verify on BSCScan
  console.log("\nVerifying on BSCScan...");
  try {
    await run("verify:verify", {
      address,
      constructorArguments: [TREASURY, BRIDGE],
    });
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("Already Verified");
    } else {
      console.error("Verification failed:", error);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
