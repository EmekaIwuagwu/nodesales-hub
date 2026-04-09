const { ethers } = require('hardhat');

async function main() {
    const ROUTER_ADDR = "0xe636dd1dcC9f8Dc73b87B1A52d50E182446413b4";
    const MDUSD_ADDR  = "0x24751084393DD93E1fa86d7A0a5Dbb3dba9f80aE";
    const WDNR_ADDR   = "0x352cE5ff75723216AABa5E153112c5A66A3F2392";

    const router = await ethers.getContractAt("KortanaRouter", ROUTER_ADDR);
    
    const factoryAddr = await router.factory();
    const wdnrAddr    = await router.WDNR();
    
    console.log("--- Router Internal Config ---");
    console.log("Router Factory:", factoryAddr);
    console.log("Router WDNR   :", wdnrAddr);

    const factory = await ethers.getContractAt("IKortanaFactory", factoryAddr);
    const pair = await factory.getPair(MDUSD_ADDR, WDNR_ADDR);
    
    console.log("\n--- Factory Check ---");
    console.log("Pair for mdUSD/WDNR:", pair);

    if (pair === "0x0000000000000000000000000000000000000000") {
        console.log("❌ ERROR: The Pair is NOT registered in this Factory!");
    } else {
        console.log("✅ Pair is registered.");
    }
}

main().catch(console.error);
