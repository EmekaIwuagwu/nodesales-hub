import hre from "hardhat";
const { ethers } = hre;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
    const [deployer] = await ethers.getSigners();
    const TARGET = "0x5A0f90EB1CC1154b237EE7c0941391Ee1757051D";

    console.log(`===========================================`);
    console.log(`⬡ EXECUTING UNIFIED SMART CONTRACT TESTNET`);
    console.log(`===========================================`);

    // 1. Deploy Unified NFT Contract
    console.log("\n1️⃣ DEPLOYING NEW UNIFIED NFT/REWARDS CONTRACT...");
    const NFT = await ethers.getContractFactory("KortanaLicenseNFT");
    const nft = await NFT.deploy({ type: 0, gasLimit: 5000000 });
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();
    console.log(`✅ Architecture Deployed: ${nftAddress}`);

    // 2. Fund the Unified Pool
    console.log("\n2️⃣ FUNDING THE UNIFIED REWARDS POOL...");
    const fundTx = await deployer.sendTransaction({ to: nftAddress, value: ethers.parseEther("5"), type: 0, gasLimit: 150000 });
    await fundTx.wait();
    console.log("✅ Contract Funded with 5.0 Native DNR.");

    // 3. Mint Node directly to user
    console.log(`\n3️⃣ MINTING TIER 0 LICENSE TO ENCLAVE WALLET...`);
    const mintTx = await nft.mintLicense(TARGET, 0, { type: 0, gasLimit: 1000000 });
    await mintTx.wait();
    
    const tokens = await nft.getLicenses(TARGET);
    const myLicenseId = tokens[0];
    console.log(`✅ Genesis Node #${myLicenseId} minted securely to ${TARGET}`);

    const startBalance = await deployer.provider.getBalance(TARGET);
    console.log(`\n👉 ENCLAVE WALLET STARTING BALANCE: ${ethers.formatEther(startBalance)} DNR\n`);

    // 4. Take Anti-Retroactive Snapshot
    console.log("4️⃣ INITIATING SNAPSHOT MAPPING...");
    const initTx = await nft.distributeReward(myLicenseId, { type: 0, gasLimit: 1000000, gasPrice: ethers.parseUnits("1", "gwei") });
    await initTx.wait();
    console.log("🔒 Anti-Retroactive verification locked.");

    console.log("\n⏳ FAST FORWARDING BLOCKCHAIN TIME (2 secs)...");
    await sleep(2000);
    
    // 5. Advance epoch natively tracking Testnet
    console.log("5️⃣ PROPELLING EPOCH CLOCK FORWARD...");
    const epochTx = await nft.advanceEpoch({ type: 0, gasLimit: 500000, gasPrice: ethers.parseUnits("1", "gwei") });
    await epochTx.wait();
    console.log("✅ Epoch cycle advanced.");

    // 6. Distribute
    console.log("\n🚀 6. SMART CONTRACT AUTO-PAYOUT EXECUTING ON-CHAIN...");
    const distTx = await nft.distributeReward(myLicenseId, { type: 0, gasLimit: 1000000, gasPrice: ethers.parseUnits("1", "gwei") });
    await distTx.wait();

    console.log("⏳ Awaiting network RPC state propagation (5 seconds)...");
    await sleep(5000);

    const endBalance = await deployer.provider.getBalance(TARGET);
    const payoutDelta = endBalance - startBalance;
    const stats = await nft.totalDistributed();

    console.log(`\n🎉=======================================🎉`);
    console.log(`💳 SMART CONTRACT HAS PROCESSED PAYOUT!`);
    console.log(`📡 Contract Internal Tracker says it successfully paid out: ${ethers.formatEther(stats)} DNR natively.`);
    console.log(`📈 Enclave Balance Delta: +${ethers.formatEther(payoutDelta)} DNR registered on public RPC!`);
    console.log(`💰 New Wallet Balance for ${TARGET} is officially: ${ethers.formatEther(endBalance)} DNR`);
    console.log(`🎉=======================================🎉\n`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
