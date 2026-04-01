import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const CONTRACT_ADDRESS = "0x2333B951635Ce16A452BbeE8034AFbfA081Da856";
    const NFT = await ethers.getContractFactory("KortanaLicenseNFT");
    const nft = NFT.attach(CONTRACT_ADDRESS);

    console.log(`===========================================`);
    console.log(`⬡ KORTANA CONTRACT STATUS CHECK`);
    console.log(`===========================================`);
    
    try {
        const currentEpoch = await nft.currentEpoch();
        const lastEpochTime = await nft.lastEpochTime();
        const epochDuration = await nft.EPOCH_DURATION();
        const totalDistributed = await nft.totalDistributed();
        const balance = await ethers.provider.getBalance(CONTRACT_ADDRESS);

        const currentTime = Math.floor(Date.now() / 1000);
        const timeSinceLastEpoch = BigInt(currentTime) - lastEpochTime;
        const timeRemaining = epochDuration - timeSinceLastEpoch;

        console.log(`Current Epoch: ${currentEpoch}`);
        console.log(`Last Epoch Time: ${new Date(Number(lastEpochTime) * 1000).toLocaleString()}`);
        console.log(`Current Time   : ${new Date(currentTime * 1000).toLocaleString()}`);
        console.log(`Epoch Duration : ${Number(epochDuration) / 3600} hours`);
        console.log(`Total Historically Distributed: ${ethers.formatEther(totalDistributed)} DNR`);
        console.log(`Contract Balance: ${ethers.formatEther(balance)} DNR`);
        
        if (timeRemaining > 0n) {
            console.log(`\n⏳ Time until next Drop: ${Math.floor(Number(timeRemaining) / 3600)}h ${Math.floor((Number(timeRemaining) % 3600) / 60)}m`);
        } else {
            console.log(`\n✅ 24 hours have passed! Ready for Advance and Distribution.`);
        }

    } catch (e) {
        console.error("Error fetching contract state:", e);
    }
}

main().catch(console.error);
