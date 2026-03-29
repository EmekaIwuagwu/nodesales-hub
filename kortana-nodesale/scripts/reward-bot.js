/**
 * Kortana Reward Automation Bot
 * Monitors epochs and triggers DNR payouts automatically.
 * Recommended Running: pm2 start scripts/reward-bot.js
 */

import pkg from "hardhat";
import "dotenv/config";
const { ethers } = pkg;

// Configuration
const REWARDS_ADDRESS = process.env.REWARDS_ADDRESS;
const BATCH_SIZE = 100; // Distribute 100 licenses per transaction

async function main() {
    if (!REWARDS_ADDRESS) {
        console.error("Please set REWARDS_ADDRESS in .env");
        return;
    }

    const [signer] = await ethers.getSigners();
    console.log(`Starting Reward Bot with address: ${signer.address}`);

    const rewards = await ethers.getContractAt("KortanaRewards", REWARDS_ADDRESS);
    const nftAddress = await rewards.licenseContract();
    const nft = await ethers.getContractAt("KortanaLicenseNFT", nftAddress);

    while (true) {
        try {
            const lastEpoch = await rewards.lastEpochTime();
            const duration = await rewards.EPOCH_DURATION();
            const now = Math.floor(Date.now() / 1000);

            if (now >= Number(lastEpoch) + Number(duration)) {
                console.log(`\n--- ADVANCING EPOCH ---`);
                const tx = await rewards.advanceEpoch();
                await tx.wait();
                const currentEpoch = await rewards.currentEpoch();
                console.log(`Epoch Advanced to: ${currentEpoch}`);

                // Distribution Phase
                const nextId = await nft.nextLicenseId();
                const totalIds = Number(nextId) - 1;
                console.log(`Total Licenses to distribute: ${totalIds}`);

                for (let i = 1; i <= totalIds; i += BATCH_SIZE) {
                    const start = i;
                    const end = Math.min(i + BATCH_SIZE - 1, totalIds);
                    console.log(`Distributing rewards for IDs ${start} to ${end}...`);
                    
                    const distTx = await rewards.distributeAllRewards(start, end);
                    await distTx.wait();
                    console.log(`Batch ${start}-${end} distributed successfully.`);
                }
                
                console.log(`Epoch distribution complete. Sleeping for next cycle...`);
            } else {
                const waitTime = Number(lastEpoch) + Number(duration) - now;
                console.log(`Waiting for next epoch cycle (${waitTime} seconds remaining)...`);
            }
        } catch (error) {
            console.error("Error in bot cycle:", error.message);
        }

        // Wait 60 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 60000));
    }
}

main().catch(console.error);
