const { ethers } = require('hardhat');

async function main() {
    const ROUTER_ADDR = "0xFb767c2b0b60dA8322686c1a32bA8Fe188Da8825";
    const EXPECTED_FACTORY = "0x306Ff98Caa25Fee776dDF7a0D00EB2514B1Da2c6";
    const EXPECTED_WDNR = "0x352cE5ff75723216AABa5E153112c5A66A3F2392";

    const [deployer] = await ethers.getSigners();
    const router = await ethers.getContractAt([
        "function factory() view returns (address)",
        "function WDNR() view returns (address)"
    ], ROUTER_ADDR);

    try {
        const actualFactory = await router.factory();
        const actualWDNR = await router.WDNR();

        console.log("--- Router Configuration ---");
        console.log("Router Address:", ROUTER_ADDR);
        console.log("Actual Factory:", actualFactory);
        console.log("Actual WDNR   :", actualWDNR);

        if (actualFactory.toLowerCase() !== EXPECTED_FACTORY.toLowerCase()) {
            console.log("❌ ERROR: Router is pointing to WRONG Factory!");
            console.log("Expected:", EXPECTED_FACTORY);
        } else if (actualWDNR.toLowerCase() !== EXPECTED_WDNR.toLowerCase()) {
            console.log("❌ ERROR: Router is pointing to WRONG WDNR!");
            console.log("Expected:", EXPECTED_WDNR);
        } else {
            console.log("✅ Router configuration matches what the frontend expects.");
        }
    } catch (e) {
        console.log("❌ Could not read Router state. The address might not be a KortanaRouter contract.");
        console.error(e);
    }
}

main().catch(console.error);
