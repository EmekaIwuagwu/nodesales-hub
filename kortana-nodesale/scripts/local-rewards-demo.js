import hre from "hardhat";
const { ethers } = hre;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
    const [deployer] = await ethers.getSigners();
    const TARGET_ADDRESS = "0x5A0f90EB1CC1154b237EE7c0941391Ee1757051D"; // Your requested address

    console.log(`===========================================`);
    console.log(`⬡ LOCAL KORTANA REWARD SIMULATION`);
    console.log(`===========================================`);

    // 1. Deploy pristine fresh local environment
    console.log("\n1️⃣ SPINNING UP LOCAL KORTANA BLOCKCHAIN NODE...");
    const NFT = await ethers.getContractFactory("KortanaLicenseNFT");
    const nft = await NFT.deploy();
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();

    const Rewards = await ethers.getContractFactory("KortanaRewards");
    const rewards = await Rewards.deploy(nftAddress);
    await rewards.waitForDeployment();
    const rewardsAddress = await rewards.getAddress();
    console.log("✅ Core Contracts Deployed to Local RPC");

    // 2. Fund the Pool
    console.log("\n2️⃣ FUNDING REWARD POOL WITH 100 DNR...");
    await deployer.sendTransaction({ to: rewardsAddress, value: ethers.parseEther("100") });

    // 3. Mint your Node
    console.log(`\n3️⃣ MINTING TIER 0 GENESIS NODE TO: ${TARGET_ADDRESS}`);
    await nft.mintLicense(TARGET_ADDRESS, 0); // Genesis Node
    const tokens = await nft.getLicenses(TARGET_ADDRESS);
    const myLicenseId = tokens[0];
    console.log(`✅ Success! Node License #${myLicenseId} mapped to your wallet.`);

    const startBalance = await deployer.provider.getBalance(TARGET_ADDRESS);
    console.log(`\n👉 WAITING... (Initial Wallet Balance: ${ethers.formatEther(startBalance)} DNR)`);

    // 4. Initial Lock Snapshot
    console.log("\n4️⃣ EXECUTING 1ST DISTRIBUTE (SECURITY SNAPSHOT)...");
    await rewards.distributeReward(myLicenseId);
    console.log("🔒 Anti-Retroactive Snapshot locked.");

    // 5. Fast Forward Time & Epoch natively
    console.log("\n⏳ FAST FORWARDING BLOCKCHAIN TIME (Simulating 36 minutes)...");
    await ethers.provider.send("evm_increaseTime", [2160]); // 36 minutes
    await ethers.provider.send("evm_mine");
    
    console.log("5️⃣ ADVANCING EPOCH IN SMART CONTRACT...");
    await rewards.advanceEpoch();
    console.log("✅ Epoch advanced properly.");

    // 6. Distribute
    console.log("\n🚀 6. PAYING OUT EARNED TOKENS...");
    const tx = await rewards.distributeReward(myLicenseId);
    await tx.wait(); // Wait for receipt to guarantee payout

    const endBalance = await deployer.provider.getBalance(TARGET_ADDRESS);
    const payoutDelta = endBalance - startBalance;

    console.log(`\n🎉=======================================🎉`);
    console.log(`💳 TOKENS DEPOSITED!`);
    console.log(`📈 Earning Delta: +${ethers.formatEther(payoutDelta)} DNR automatically sent to you!`);
    console.log(`💰 New Wallet Balance for ${TARGET_ADDRESS} is now: ${ethers.formatEther(endBalance)} DNR`);
    console.log(`🎉=======================================🎉\n`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
