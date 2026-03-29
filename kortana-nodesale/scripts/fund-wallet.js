import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const [deployer] = await ethers.getSigners();
    const TARGET = "0x5A0f90EB1CC1154b237EE7c0941391Ee1757051D";

    console.log(`===========================================`);
    console.log(`⬡ EXECUTING DIRECT TESTNET PAYLOAD ROUTING`);
    console.log(`===========================================`);
    
    const balanceBefore = await deployer.provider.getBalance(TARGET);
    console.log(`👉 Wallet ${TARGET} Initial Balance: ${ethers.formatEther(balanceBefore)} DNR`);

    console.log("\n🚀 Beaming 10.0 Native DNR to Enclave Wallet over Testnet RPC...");
    const tx = await deployer.sendTransaction({
        to: TARGET,
        value: ethers.parseEther("10.0"),
        type: 0 // Legacy EIP formatting for Poseidon
    });
    
    console.log(`⏳ Awaiting block confirmation...`);
    await tx.wait();
    
    const balanceAfter = await deployer.provider.getBalance(TARGET);
    console.log(`\n✅ TRANSFER COMPLETE! VIRTUAL AIRDROP DELIVERED.`);
    console.log(`📈 New Enclave Balance: ${ethers.formatEther(balanceAfter)} DNR`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
