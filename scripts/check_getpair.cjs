const { ethers } = require('hardhat');

async function main() {
    const FACTORY_ADDR = "0x306Ff98Caa25Fee776dDF7a0D00EB2514B1Da2c6";
    const MDUSD_ADDR   = "0x24751084393DD93E1fa86d7A0a5Dbb3dba9f80aE";
    const WDNR_ADDR    = "0x352cE5ff75723216AABa5E153112c5A66A3F2392";

    const factory = await ethers.getContractAt("IKortanaFactory", FACTORY_ADDR);
    
    console.log("Checking getPair(mdUSD, WDNR)...");
    const pair = await factory.getPair(MDUSD_ADDR, WDNR_ADDR);
    
    console.log("Result:", pair);
    
    if (pair === "0x0000000000000000000000000000000000000000") {
        console.log("❌ PAIR NOT FOUND!");
    } else {
        console.log("✅ PAIR FOUND AT:", pair);
    }
}

main().catch(console.error);
