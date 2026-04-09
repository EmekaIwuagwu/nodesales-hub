const { ethers } = require('hardhat');

async function main() {
    const MDUSD = "0x24751084393DD93E1fa86d7A0a5Dbb3dba9f80aE";
    const WDNR = "0x352cE5ff75723216AABa5E153112c5A66A3F2392";
    const FACTORY_ADDR = "0x306Ff98Caa25Fee776dDF7a0D00EB2514B1Da2c6";

    const [deployer] = await ethers.getSigners();
    console.log("Checking state for deployer:", deployer.address);

    const factory = await ethers.getContractAt("IKortanaFactory", FACTORY_ADDR);
    const pairAddr = await factory.getPair(MDUSD, WDNR);
    console.log("Pair Address from Factory:", pairAddr);

    if (pairAddr === ethers.ZeroAddress) {
        console.log("❌ Pair NOT registered in factory.");
        return;
    }

    const pair = await ethers.getContractAt("IKortanaPair", pairAddr);
    
    try {
        const t0 = await pair.token0();
        const t1 = await pair.token1();
        const fac = await pair.factory();
        const [r0, r1] = await pair.getReserves();

        console.log("--- Pair State ---");
        console.log("token0:", t0);
        console.log("token1:", t1);
        console.log("factory in pair:", fac);
        console.log("Reserves:", r0.toString(), r1.toString());

        if (t0 === ethers.ZeroAddress || t1 === ethers.ZeroAddress) {
            console.log("❌ Pair is NOT initialized!");
        } else if (fac.toLowerCase() !== FACTORY_ADDR.toLowerCase()) {
            console.log("❌ Pair points to WRONG factory:", fac);
        } else {
            console.log("✅ Pair looks correctly initialized.");
        }
    } catch (e) {
        console.log("❌ Failed to read pair state. It might not be a KortanaPair contract or is severely broken.");
        console.error(e);
    }
}

main().catch(console.error);
