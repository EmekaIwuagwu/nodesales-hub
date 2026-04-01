import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const CONTRACT_ADDRESS = "0x2333B951635Ce16A452BbeE8034AFbfA081Da856";
    const NFT = await ethers.getContractFactory("KortanaLicenseNFT");
    const nft = NFT.attach(CONTRACT_ADDRESS);

    const currentEpoch = await nft.currentEpoch();
    const lastEpochTime = await nft.lastEpochTime();
    const now = Math.floor(Date.now() / 1000);
    const duration = await nft.EPOCH_DURATION();

    console.log(`--- EPOCH STATUS ---`);
    console.log(`Current Epoch: ${currentEpoch}`);
    console.log(`Last Epoch Advance: ${new Date(Number(lastEpochTime) * 1000).toLocaleString()}`);
    console.log(`Current Time      : ${new Date(now * 1000).toLocaleString()}`);
    console.log(`Duration          : ${duration} seconds (${Number(duration)/60} minutes)`);
    
    const timeRemaining = BigInt(now) - lastEpochTime >= duration ? 0n : (lastEpochTime + duration) - BigInt(now);
    console.log(`Time Remaining    : ${timeRemaining} seconds`);
    console.log(`Ready to Advance? : ${timeRemaining === 0n}`);
    console.log(`Total Distributed : ${ethers.formatEther(await nft.totalDistributed())} DNR`);
    
    const id = 1;
    console.log(`\n--- USER Payout Status (Node #1) ---`);
    console.log(`Owner: ${await nft.ownerOf(id)}`);
    console.log(`Last Claimed Epoch: ${await nft.lastClaimedEpoch(id)}`);
}

main().catch(console.error);
