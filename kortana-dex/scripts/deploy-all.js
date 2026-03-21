const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("================================================================");
  console.log("🚀 KORTANASWAP DEPLOYMENT STARTING...");
  console.log("================================================================");
  console.log("Deployer:", deployer.address);
  console.log("Network:", network.name);
  console.log("Balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // 1. Deploy WDNR (Wrapped DNR)
  console.log("\n📦 1. Deploying WDNR...");
  const WDNR = await ethers.getContractFactory("WDNR");
  const wdnr = await WDNR.deploy();
  await wdnr.waitForDeployment();
  console.log("WDNR Address:", await wdnr.getAddress());

  // 2. Deploy KortanaFactory
  console.log("\n📦 2. Deploying KortanaFactory...");
  const KortanaFactory = await ethers.getContractFactory("KortanaFactory");
  const factory = await KortanaFactory.deploy(deployer.address);
  await factory.waitForDeployment();
  console.log("KortanaFactory Address:", await factory.getAddress());

  // 3. Deploy SwapRouter
  console.log("\n📦 3. Deploying SwapRouter...");
  const SwapRouter = await ethers.getContractFactory("SwapRouter");
  const router = await SwapRouter.deploy(await factory.getAddress(), await wdnr.getAddress());
  await router.waitForDeployment();
  console.log("SwapRouter Address:", await router.getAddress());

  // 4. Update .env.local with addresses
  const envPath = path.join(__dirname, "../.env.local");
  let envContent = fs.readFileSync(envPath, "utf8");

  const isTestnet = network.name === "kortanaTestnet";
  const prefix = isTestnet ? "TESTNET" : "MAINNET";

  envContent = envContent.replace(
    new RegExp(`NEXT_PUBLIC_FACTORY_ADDRESS_${prefix}=.*`),
    `NEXT_PUBLIC_FACTORY_ADDRESS_${prefix}=${await factory.getAddress()}`
  );
  envContent = envContent.replace(
    new RegExp(`NEXT_PUBLIC_ROUTER_ADDRESS_${prefix}=.*`),
    `NEXT_PUBLIC_ROUTER_ADDRESS_${prefix}=${await router.getAddress()}`
  );
  envContent = envContent.replace(
    new RegExp(`NEXT_PUBLIC_WDNR_ADDRESS_${prefix}=.*`),
    `NEXT_PUBLIC_WDNR_ADDRESS_${prefix}=${await wdnr.getAddress()}`
  );

  fs.writeFileSync(envPath, envContent);
  console.log("\n✅ Deployment Addresses updated in .env.local");

  // 5. Verify Contracts (Optional)
  if (network.name !== "hardhat") {
    console.log("\n🔍 Verification recommended. Run:");
    console.log(`npx hardhat verify --network ${network.name} ${await factory.getAddress()} ${deployer.address}`);
    console.log(`npx hardhat verify --network ${network.name} ${await router.getAddress()} ${await factory.getAddress()} ${await wdnr.getAddress()}`);
  }

  console.log("\n================================================================");
  console.log("🎉 KORTANASWAP DEPLOYMENT COMPLETE!");
  console.log("================================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
