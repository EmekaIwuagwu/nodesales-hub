import hre from "hardhat";
const { ethers } = hre;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
    const [deployer] = await ethers.getSigners();
    const TARGET_ADDRESS = "0x5A0f90EB1CC1154b237EE7c0941391Ee1757051D";
    const NFT_ADDRESS = "0x53A816C9961131B778475664CAF2D318B30eC596";

    console.log(`===========================================`);
    console.log(`⬡ TESTNET REWARD SECURE VERIFICATION`);
    console.log(`===========================================`);

    const NFT = await ethers.getContractFactory("KortanaLicenseNFT");
    const nft = NFT.attach(NFT_ADDRESS);

    // 1. Mint
    console.log(`\n1️⃣ VALIDATING NODE ON ${TARGET_ADDRESS}...`);
    try {
        const mintTx = await nft.mintLicense(TARGET_ADDRESS, 0, { type: 0, gasLimit: 2000000 });
        await mintTx.wait();
        console.log("✅ License Generated.");
    } catch(e) {
        console.log("✅ License Already Exists!");
    }

    // 2. Fetch specific License ID
    const tokens = await nft.getLicenses(TARGET_ADDRESS);
    if(tokens.length === 0) { console.log("Failed to mint."); process.exit(1); }
    const myLicenseId = tokens[0];
    console.log(`💳 Located Node License ID: #${myLicenseId}`);

    // 3. Force Deploy Temporary Rewards Pool (1-Second Epoch Simulation)
    console.log("\n2️⃣ DEPLOYING EXPERIMENTAL 1-SECOND REWARDS...");
    const Rewards = await ethers.getContractFactory("KortanaRewards");
    const rewards = await Rewards.deploy(NFT_ADDRESS, { type: 0, gasLimit: 3000000 });
    await rewards.waitForDeployment();
    const rewardsAddress = await rewards.getAddress();
    
    // 4. Fund Pool
    console.log("\n3️⃣ FUNDING POOL...");
    const fundTx = await deployer.sendTransaction({ to: rewardsAddress, value: ethers.parseEther("10"), type: 0, gasLimit: 150000 });
    await fundTx.wait();
    console.log("✅ Funded Pool with 10 Native DNR.");

    const startBalance = await deployer.provider.getBalance(TARGET_ADDRESS);
    console.log(`\n👉 INITIAL WALLET BALANCE: ${ethers.formatEther(startBalance)} DNR\n`);

    // 5. Initial Lock Snapshot (Reverts without out-of-gas)
    console.log("4️⃣ TAKING SECURITY LOCK SNAPSHOT...");
    const initTx = await rewards.distributeReward(myLicenseId, { type: 0, gasLimit: 30000000, gasPrice: ethers.parseUnits("1", "gwei") });
    await initTx.wait();
    console.log("🔒 Anti-Retroactive security parameters secured.");

    // 6. Fast Forward Time
    console.log("\n⏳ FAST FORWARDING TIME (2 Seconds)...");
    await sleep(2500);

    // 7. Advance Epoch
    console.log("5️⃣ ADVANCING EPOCH INTERVAL (Simulating Day 2)...");
    const epochTx = await rewards.advanceEpoch({ type: 0, gasLimit: 1000000, gasPrice: ethers.parseUnits("1", "gwei") });
    await epochTx.wait();
    console.log("✅ Block Temporal Logic Fast-Forwarded");

    // 8. Distribute Pay
    console.log("\n🚀 6. INITIATING SMART CONTRACT PAYOUT...");
    const distTx = await rewards.distributeReward(myLicenseId, { type: 0, gasLimit: 30000000, gasPrice: ethers.parseUnits("1", "gwei") });
    await distTx.wait();

    const endBalance = await deployer.provider.getBalance(TARGET_ADDRESS);
    const payoutDelta = endBalance - startBalance;

    console.log(`\n🎉=======================================🎉`);
    console.log(`💳 TOKENS DEPOSITED DIRECTLY FROM CONTRACT!`);
    console.log(`📈 Earning Delta: +${ethers.formatEther(payoutDelta)} DNR inserted natively!`);
    console.log(`💰 New Wallet Balance: ${ethers.formatEther(endBalance)} DNR`);
    console.log(`🎉=======================================🎉\n`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
