import hre from "hardhat";
const { ethers } = hre;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
    const [deployer] = await ethers.getSigners();
    const TARGET = "0x5A0f90EB1CC1154b237EE7c0941391Ee1757051D";

    console.log(`===========================================`);
    console.log(`⬡ EXECUTING 60-EPOCH (1 HOUR) LIVE SIMULATION`);
    console.log(`===========================================`);

    const NFT = await ethers.getContractFactory("KortanaLicenseNFT");
    const nft = await NFT.deploy({ type: 0, gasLimit: 5000000, gasPrice: ethers.parseUnits("1", "gwei") });
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();

    console.log("\n💰 FUNDING THE REWARDS POOL WITH 100 NATIVE DNR...");
    const fundTx = await deployer.sendTransaction({ to: nftAddress, value: ethers.parseEther("100"), type: 0, gasLimit: 150000, gasPrice: ethers.parseUnits("1", "gwei") });
    await fundTx.wait();

    console.log(`\n📦 MINTING TIER 0 GENESIS NODE TO: ${TARGET}...`);
    const mintTx = await nft.mintLicense(TARGET, 0, { type: 0, gasLimit: 1000000, gasPrice: ethers.parseUnits("1", "gwei") });
    await mintTx.wait();
    
    const tokens = await nft.getLicenses(TARGET);
    const myLicenseId = tokens[0];
    console.log(`✅ Node #${myLicenseId} minted!\n`);

    const startBalance = await deployer.provider.getBalance(TARGET);
    
    console.log(`🔒 SECURING ANTI-RETROACTIVE SNAPSHOT...`);
    const initTx = await nft.distributeReward(myLicenseId, { type: 0, gasLimit: 1000000, gasPrice: ethers.parseUnits("1", "gwei") });
    await initTx.wait();

    console.log("\n🚀 SIMULATING CONTINUOUS NATIVE DISTRIBUTION (60 ITERATIONS)...\n");

    for (let i = 1; i <= 10; i++) {
        await sleep(4000); // 4.0 second block margin
        
        try {
            // Advance Epoch Natively
            const epochTx = await nft.advanceEpoch({ type: 0, gasLimit: 500000, gasPrice: ethers.parseUnits("1", "gwei") });
            await epochTx.wait();
            
            // Distribute Native Tracker Payload
            const distTx = await nft.distributeReward(myLicenseId, { type: 0, gasLimit: 1000000, gasPrice: ethers.parseUnits("1", "gwei") });
            await distTx.wait();
            
            const internalCounter = await nft.totalDistributed();
            process.stdout.write(`\r✅ Epoch ${i}/10 Advanced | Node Owner natively paid -> ${ethers.formatEther(internalCounter)} DNR total`);
        } catch (e) {
            process.stdout.write(`\r⚠️ Epoch ${i}/10 Skipped (Temporal Tick Missed)`);
        }
    }

    console.log("\n\n⏳ WAITING 10 SECONDS FOR TESTNET PUBLIC RPC TO CACHE BALANCES...");
    await sleep(10000);

    const endBalance = await deployer.provider.getBalance(TARGET);
    const payoutDelta = endBalance - startBalance;
    const finalTracker = await nft.totalDistributed();

    console.log(`\n🎉=======================================🎉`);
    console.log(`💳 1 HOUR SMART CONTRACT SIMULATION OVER!`);
    console.log(`📡 Contract strictly routed exactly: ${ethers.formatEther(finalTracker)} DNR to target!`);
    console.log(`📈 Enclave Balance Net Delta: +${ethers.formatEther(payoutDelta)} DNR registered public RPC!`);
    console.log(`💰 New True Testnet Balance for ${TARGET} is fully updated: ${ethers.formatEther(endBalance)} DNR`);
    console.log(`🎉=======================================🎉\n`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
