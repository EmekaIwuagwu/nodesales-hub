/**
 * Kortana Node Sale — End-to-End Test Cycle
 * Prepares the environment after deployment for a full life-cycle test.
 * Usage: npx hardhat run scripts/test-cycle.js --network testnet
 */

import pkg from "hardhat";
import "dotenv/config";
const { ethers } = pkg;

async function main() {
    const NFT_ADDRESS = process.env.NFT_ADDRESS;
    const REWARDS_ADDRESS = process.env.REWARDS_ADDRESS;

    if (!NFT_ADDRESS || !REWARDS_ADDRESS) {
        console.error("Missing addresses in .env");
        return;
    }

    const [owner, buyer] = await ethers.getSigners();
    console.log(`Using owner: ${owner.address}`);
    console.log(`Using test buyer: ${buyer ? buyer.address : owner.address}`);

    const nft = await ethers.getContractAt("KortanaLicenseNFT", NFT_ADDRESS);
    const rewards = await ethers.getContractAt("KortanaRewards", REWARDS_ADDRESS);

    // 1. FUND REWARDS CONTRACT (50 DNR for testing)
    console.log(`\n--- FUNDING REWARDS POOL ---`);
    const fundAmount = ethers.parseEther("50");
    const fundTx = await owner.sendTransaction({
        to: REWARDS_ADDRESS,
        value: fundAmount
    });
    await fundTx.wait();
    console.log(`Funded 50 DNR to pool.`);

    // 2. MINT SAMPLE LICENSES
    console.log(`\n--- MINTING SAMPLE LICENSES (TIERS 0-3) ---`);
    const receiver = buyer ? buyer.address : owner.address;
    
    for (let tier = 0; tier < 4; tier++) {
        console.log(`Minting Tier ${tier} to ${receiver}...`);
        const mintTx = await nft.mintLicense(receiver, tier);
        await mintTx.wait();
    }
    console.log(`Minting complete.`);

    // 3. SET BASE URI (Sample)
    console.log(`\n--- SETTING SAMPLE BASE URI ---`);
    const setBaseTx = await nft.setBaseURI("ipfs://QmYxX/");
    await setBaseTx.wait();
    console.log(`Base URI set to ipfs://QmYxX/`);

    // 4. CHECK STATUS
    const balance = await rewards.poolBalance();
    const nextId = await nft.nextLicenseId();
    console.log(`\nDone! Status:`);
    console.log(`Pool Balance: ${ethers.formatEther(balance)} DNR`);
    console.log(`Total Licenses Minted: ${Number(nextId) - 1}`);
    console.log(`\nNext: Run 'pm2 start scripts/reward-bot.js' and wait 36 minutes to see the first rewards arrival.`);
}

main().catch(console.error);
