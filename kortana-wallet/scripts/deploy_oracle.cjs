const hre = require("hardhat");

async function main() {
    console.log("Preparing deployment to Kortana Enclave...");

    const PriceOracle = await hre.ethers.getContractFactory("KortanaPriceOracle");
    const oracle = await PriceOracle.deploy();

    await oracle.waitForDeployment();

    const address = await oracle.getAddress();
    console.log("--------------------------------------------------");
    console.log("Kortana Price Oracle deployed to:", address);
    console.log("--------------------------------------------------");
    console.log("Action Required: Update PRICE_ORACLE_ADDRESS in src/lib/constants.ts");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
