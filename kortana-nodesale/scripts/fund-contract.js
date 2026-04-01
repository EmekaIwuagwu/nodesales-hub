import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const [deployer] = await ethers.getSigners();
    
    // The exact Live Testnet Smart Contract
    const CONTRACT_ADDRESS = "0x2333B951635Ce16A452BbeE8034AFbfA081Da856";

    console.log(`===========================================`);
    console.log(`⬡ FUNDING THE TESTNET MASTER TREASURY`);
    console.log(`===========================================`);
    
    const initialBal = await deployer.provider.getBalance(CONTRACT_ADDRESS);
    console.log(`👉 Smart Contract Current Treasury: ${ethers.formatEther(initialBal)} DNR`);

    console.log("\n🚀 Beaming 100,000 Native DNR from Foundation to the Smart Contract...");
    const tx = await deployer.sendTransaction({
        to: CONTRACT_ADDRESS,
        value: ethers.parseEther("100000"),
        type: 0,
        gasLimit: 100000,
        gasPrice: ethers.parseUnits("1", "gwei")
    });
    
    console.log(`⏳ Awaiting strict Blockchain verification...`);
    await tx.wait();
    
    const finalBal = await deployer.provider.getBalance(CONTRACT_ADDRESS);
    console.log(`\n✅ TREASURY FULLY CHARGED.`);
    console.log(`📈 New Autonomous Smart Contract Treasury: ${ethers.formatEther(finalBal)} DNR`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
