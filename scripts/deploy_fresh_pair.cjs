const { ethers } = require('hardhat');

async function main() {
    const FACTORY_ADDR = "0x306Ff98Caa25Fee776dDF7a0D00EB2514B1Da2c6";
    const MDUSD_ADDR   = "0x24751084393DD93E1fa86d7A0a5Dbb3dba9f80aE";
    const WDNR_ADDR    = "0x352cE5ff75723216AABa5E153112c5A66A3F2392";

    const [deployer] = await ethers.getSigners();
    console.log("Creating Fresh Pair from Factory...");

    // 1. Deploy Pair Template
    const KortanaPair = await ethers.getContractFactory("KortanaPair");
    const pairTemplate = await KortanaPair.deploy();
    await pairTemplate.waitForDeployment();
    const pairTemplateAddr = await pairTemplate.getAddress();
    console.log("Template:", pairTemplateAddr);

    // 2. Initialize and Register in Factory
    const factory = await ethers.getContractAt("KortanaFactory", FACTORY_ADDR);
    
    console.log("Initializing and Registering...");
    await (await pairTemplate.initialize(MDUSD_ADDR, WDNR_ADDR)).wait();
    await (await pairTemplate.setFactory(FACTORY_ADDR)).wait();
    
    // Register
    await (await factory.registerPair(pairTemplateAddr)).wait();

    console.log("\n✅ FRESH PAIR READY AND REGISTERED!");
    console.log("Pair Address:", pairTemplateAddr);
}

main().catch(console.error);
