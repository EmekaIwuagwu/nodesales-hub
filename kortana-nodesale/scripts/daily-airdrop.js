import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const [deployer] = await ethers.getSigners();
    
    // MAINNET OFFICIAL CONTRACT ADDRESS (Replace after you run deploy.js on mainnet)
    const CONTRACT_ADDRESS = "0x2333B951635Ce16A452BbeE8034AFbfA081Da856";
    
    console.log(`===========================================`);
    console.log(`⬡ KORTANA OFFICIAL DAILY AIRDROP BOT`);
    console.log(`===========================================`);
    console.log(`📡 Time Executed: ${new Date().toISOString()}`);

    const NFT = await ethers.getContractFactory("KortanaLicenseNFT");
    const nft = NFT.attach(CONTRACT_ADDRESS);

    try {
        console.log("1️⃣ Checking Epoch Timestamps...");
        const lastEpoch = await nft.lastEpochTime();
        const duration = await nft.EPOCH_DURATION();
        
        const timestamp = BigInt(Math.floor(Date.now() / 1000));
        
        if (timestamp >= (lastEpoch + duration)) {
            console.log("✅ 24 Hours have passed! Triggering Epoch Advance...");
            const epochTx = await nft.advanceEpoch({ gasLimit: 2000000 });
            await epochTx.wait();
            console.log("✅ Epoch successfully progressed.");
        } else {
            console.log("⚠️ 24 Hours has NOT fully passed since last Epoch. Skipping Advance.");
            // We can optionally proceed to distribute anyway if any previous nodes missed yesterday's payout!
        }

        console.log("\n2️⃣ EXECUTING MASS NATIVE DISTRIBUTION TO ALL ACTIVE USERS...");
        // 999999 serves as a hard-cap fallback, Smart Contract algorithm dynamically overrides it to nextLicenseId automatically
        const distTx = await nft.distributeAllRewards(1, 999999, { gasLimit: 10000000 });
        await distTx.wait();

        const totalPaid = await nft.totalDistributed();
        console.log(`\n🎉=======================================🎉`);
        console.log(`💳 GLOBAL PAYOUT CYCLE COMPLETE!`);
        console.log(`💰 Total DNR Historically Airdropped: ${ethers.formatEther(totalPaid)} DNR`);
        console.log(`🎉=======================================🎉\n`);

    } catch (e) {
        console.log(`\n❌ ERROR: Transaction reverted.`);
        if (e.data) console.log("Revert Data:", e.data);
        if (e.reason) console.log("Reason:", e.reason);
        console.error(e.message);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
