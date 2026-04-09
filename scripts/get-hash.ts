import hre from "hardhat";

async function main() {
    const KortanaPair = await hre.ethers.getContractFactory("KortanaPair");
    const initCodeHash = hre.ethers.keccak256(KortanaPair.bytecode);
    console.log("INIT_CODE_HASH:", initCodeHash);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
