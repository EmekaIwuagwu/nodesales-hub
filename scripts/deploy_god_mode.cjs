const { ethers } = require('hardhat');

async function main() {
    const WDNR_ADDR  = "0x352cE5ff75723216AABa5E153112c5A66A3F2392";
    const MDUSD_ADDR = "0x24751084393DD93E1fa86d7A0a5Dbb3dba9f80aE";

    const [deployer] = await ethers.getSigners();
    console.log("God Mode: Deploying Pure Ecosystem from", deployer.address);

    // 1. Deploy Pure Factory
    const KortanaFactory = await ethers.getContractFactory("KortanaFactory");
    const factory = await KortanaFactory.deploy(deployer.address);
    await factory.waitForDeployment();
    const factoryAddr = await factory.getAddress();
    console.log("NEW FACTORY:", factoryAddr);

    // 2. Deploy Pure Router
    const KortanaRouter = await ethers.getContractFactory("KortanaRouter");
    const router = await KortanaRouter.deploy(factoryAddr, WDNR_ADDR);
    await router.waitForDeployment();
    const routerAddr = await router.getAddress();
    console.log("NEW ROUTER :", routerAddr);

    // 3. Deploy Pure Pair
    const KortanaPair = await ethers.getContractFactory("KortanaPair");
    const pair = await KortanaPair.deploy();
    await pair.waitForDeployment();
    const pairAddr = await pair.getAddress();
    console.log("NEW PAIR   :", pairAddr);

    // 4. Initialize & Register
    console.log("Initializing Pair...");
    await (await pair.initialize(MDUSD_ADDR, WDNR_ADDR)).wait();
    await (await pair.setFactory(factoryAddr)).wait();
    
    console.log("Registering in Factory...");
    await (await factory.registerPair(MDUSD_ADDR, WDNR_ADDR, pairAddr)).wait();

    console.log("\n🚀 GOD MODE DEPLOYMENT SUCCESS!");
    console.log("Factory:", factoryAddr);
    console.log("Router :", routerAddr);
    console.log("Pair   :", pairAddr);
}

main().catch(console.error);
