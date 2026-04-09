const { ethers } = require('hardhat');

async function main() {
    const FACTORY_ADDR = "0x306Ff98Caa25Fee776dDF7a0D00EB2514B1Da2c6";
    const WDNR_ADDR    = "0x352cE5ff75723216AABa5E153112c5A66A3F2392";
    const MDUSD_ADDR   = "0x24751084393DD93E1fa86d7A0a5Dbb3dba9f80aE";

    const [deployer] = await ethers.getSigners();
    console.log("Deploying Trimmed & Safe Ecosystem...");

    // 1. Deploy Trimmed Router
    const KortanaRouter = await ethers.getContractFactory("KortanaRouter");
    const router = await KortanaRouter.deploy(FACTORY_ADDR, WDNR_ADDR);
    await router.waitForDeployment();
    const routerAddr = await router.getAddress();
    console.log("New Router:", routerAddr);

    // 2. Deploy Safe Pair
    const KortanaPair = await ethers.getContractFactory("KortanaPair");
    const pair = await KortanaPair.deploy();
    await pair.waitForDeployment();
    const pairAddr = await pair.getAddress();
    console.log("New Safe Pair:", pairAddr);

    // 3. Initialize Pair
    await (await pair.initialize(MDUSD_ADDR, WDNR_ADDR)).wait();
    await (await pair.setFactory(FACTORY_ADDR)).wait();

    // 4. Register in Factory (using 3 args version)
    const factory = await ethers.getContractAt("KortanaFactory", FACTORY_ADDR);
    await (await factory.registerPair(MDUSD_ADDR, WDNR_ADDR, pairAddr)).wait();

    console.log("\n✅ DEPLOYMENT COMPLETE!");
    console.log("ROUTER:", routerAddr);
    console.log("PAIR  :", pairAddr);
}

main().catch(console.error);
