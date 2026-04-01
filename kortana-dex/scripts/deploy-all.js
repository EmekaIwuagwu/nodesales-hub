const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const signers = await ethers.getSigners();
  if (!signers || signers.length === 0) {
    console.error("❌ ERROR: No deployer found. Check DEPLOYER_PRIVATE_KEY in .env.local.");
    process.exit(1);
  }
  const deployer = signers[0];
  
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
  const wdnrAddress = await wdnr.getAddress();
  console.log("WDNR Address:", wdnrAddress);

  // 2. Deploy KortanaFactory
  console.log("\n📦 2. Deploying KortanaFactory...");
  const KortanaFactory = await ethers.getContractFactory("KortanaFactory");
  const factory = await KortanaFactory.deploy(deployer.address);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("KortanaFactory Address:", factoryAddress);

  // 3. Deploy SwapRouter
  console.log("\n📦 3. Deploying SwapRouter...");
  const SwapRouter = await ethers.getContractFactory("SwapRouter");
  const router = await SwapRouter.deploy(factoryAddress, wdnrAddress);
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();
  console.log("SwapRouter Address:", routerAddress);

  // 4. Deploy PositionManager
  console.log("\n📦 4. Deploying NonfungiblePositionManager...");
  const NPM = await ethers.getContractFactory("NonfungiblePositionManager");
  const npm = await NPM.deploy(factoryAddress, wdnrAddress);
  await npm.waitForDeployment();
  const npmAddress = await npm.getAddress();
  console.log("PositionManager Address:", npmAddress);

  // 5. Update .env.local
  const envPath = path.join(__dirname, "../.env.local");
  let envContent = fs.readFileSync(envPath, "utf8");

  const isTestnet = network.name === "kortanaTestnet" || network.name === "localhost";
  const prefix = isTestnet ? "TESTNET" : "MAINNET";

  console.log(`\n🖊️ Updating .env.local for ${prefix}...`);

  const updateEnv = (key, val) => {
    const regex = new RegExp(`${key}=.*`);
    if (envContent.match(regex)) {
        envContent = envContent.replace(regex, `${key}=${val}`);
    } else {
        envContent += `\n${key}=${val}`;
    }
  };

  updateEnv(`NEXT_PUBLIC_FACTORY_ADDRESS_${prefix}`, factoryAddress);
  updateEnv(`NEXT_PUBLIC_SWAP_ROUTER_ADDRESS_${prefix}`, routerAddress);
  updateEnv(`NEXT_PUBLIC_WDNR_ADDRESS_${prefix}`, wdnrAddress);
  updateEnv(`NEXT_PUBLIC_POSITION_MANAGER_ADDRESS_${prefix}`, npmAddress);

  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env.local updated successfully.");

  console.log("\n================================================================");
  console.log("🎉 KORTANASWAP DEPLOYMENT COMPLETE!");
  console.log("================================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ DEPLOYMENT FAILED", error);
    process.exit(1);
  });
