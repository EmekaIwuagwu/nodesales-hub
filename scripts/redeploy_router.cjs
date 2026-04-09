const { ethers } = require('hardhat');

async function main() {
    const FACTORY = "0x306Ff98Caa25Fee776dDF7a0D00EB2514B1Da2c6";
    const WDNR = "0x352cE5ff75723216AABa5E153112c5A66A3F2392";

    const [deployer] = await ethers.getSigners();
    console.log("Deploying Router with correct addresses...");
    console.log("Factory:", FACTORY);
    console.log("WDNR   :", WDNR);

    const RouterFactory = await ethers.getContractFactory("KortanaRouter");
    const router = await RouterFactory.deploy(FACTORY, WDNR);
    await router.waitForDeployment();
    const routerAddr = await router.getAddress();

    console.log("\n✅ NEW ROUTER DEPLOYED AT:", routerAddr);
    console.log("Please update frontend/src/lib/contracts.ts with this address!");
}

main().catch(console.error);
