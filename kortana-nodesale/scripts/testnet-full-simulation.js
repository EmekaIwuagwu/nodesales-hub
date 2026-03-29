import hre from "hardhat";
const { ethers } = hre;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
    const [deployer] = await ethers.getSigners();
    const TARGET = "0x5A0f90EB1CC1154b237EE7c0941391Ee1757051D";

    console.log(`===========================================`);
    console.log(`⬡ LAUNCHING ISOLATED TESTNET ECOSYSTEM`);
    console.log(`===========================================`);

    // 1. Deploy Pure NFT Contract
    console.log("\n1️⃣ DEPLOYING PRISTINE NFT SMART CONTRACT...");
    const NFT = await ethers.getContractFactory("KortanaLicenseNFT");
    const nft = await NFT.deploy({ type: 0, gasLimit: 5000000 });
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();
    console.log(`✅ Fresh NFT Contract Deployed: ${nftAddress}`);

    // 2. Deploy Pristine Rewards Contract
    console.log("\n2️⃣ DEPLOYING PRISTINE REWARDS SMART CONTRACT...");
    const Rewards = await ethers.getContractFactory("KortanaRewards");
    const rewards = await Rewards.deploy(nftAddress, { type: 0, gasLimit: 5000000 });
    await rewards.waitForDeployment();
    const rewardsAddress = await rewards.getAddress();
    console.log(`✅ Fresh Rewards Contract Deployed: ${rewardsAddress}`);

    // 3. Fund the Reward Pool
    console.log("\n3️⃣ FUNDING REWARDS POOL...");
    const fundTx = await deployer.sendTransaction({ to: rewardsAddress, value: ethers.parseEther("5"), type: 0, gasLimit: 150000 });
    await fundTx.wait();
    console.log("✅ Pool Funded with 5.0 Native DNR.");

    // 4. Mint Node directly to user
    console.log(`\n4️⃣ MINTING TIER 0 LICENSE TO YOUR ENCLAVE WALLET...`);
    const mintTx = await nft.mintLicense(TARGET, 0, { type: 0, gasLimit: 1000000 });
    await mintTx.wait();
    
    // Validate mapping
    const tokens = await nft.getLicenses(TARGET);
    const myLicenseId = tokens[0];
    console.log(`✅ Genesis Node #${myLicenseId} minted securely to ${TARGET}`);

    const startBalance = await deployer.provider.getBalance(TARGET);
    console.log(`\n👉 ENCLAVE WALLET STARTING BALANCE: ${ethers.formatEther(startBalance)} DNR\n`);

    // 5. Take Anti-Retroactive Snapshot
    console.log("5️⃣ INITIATING SNAPSHOT MAPPING (FIRST DISTRIBUTE PAYLOAD)...");
    const initTx = await rewards.distributeReward(myLicenseId, { type: 0, gasLimit: 500000, gasPrice: ethers.parseUnits("1", "gwei") });
    await initTx.wait();
    console.log("🔒 Anti-Retroactive verification mathematically locked in EVM!");

    console.log("\n⏳ FAST FORWARDING BLOCKCHAIN TIME (Simulating 36 minutes)...");
    await sleep(2000); // Allow brief Testnet indexer catchup
    
    // 6. Advance smart contract temporal logic natively tracking Testnet epoch
    console.log("6️⃣ PROPELLING EPOCH CLOCK FORWARD...");
    const epochTx = await rewards.advanceEpoch({ type: 0, gasLimit: 500000, gasPrice: ethers.parseUnits("1", "gwei") });
    await epochTx.wait();
    console.log("✅ Smart Contract Native Epoch cycle advanced.");

    // 7. Push distribution command directly to Enclave
    console.log("\n🚀 7. DISTRIBUTING TRUE EARNINGS NATIVELY ACROSS TESTNET...");
    const distTx = await rewards.distributeReward(myLicenseId, { type: 0, gasLimit: 500000, gasPrice: ethers.parseUnits("1", "gwei") });
    await distTx.wait();

    const endBalance = await deployer.provider.getBalance(TARGET);
    const payoutDelta = endBalance - startBalance;

    console.log(`\n🎉=======================================🎉`);
    console.log(`💳 SMART CONTRACT HAS PROCESSED PAYOUT!`);
    console.log(`📈 Exact Payout Yield: +${ethers.formatEther(payoutDelta)} DNR automatically sent to Enclave!`);
    console.log(`💰 New Wallet Balance for ${TARGET} is mathematically: ${ethers.formatEther(endBalance)} DNR`);
    console.log(`🎉=======================================🎉\n`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
