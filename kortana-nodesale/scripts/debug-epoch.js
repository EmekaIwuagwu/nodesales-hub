import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const CONTRACT_ADDRESS = "0x60dD3Caa3Cf48C786f8bb6DD18946e18564bF7F2";
    const NFT = await ethers.getContractFactory("KortanaLicenseNFT");
    const nft = NFT.attach(CONTRACT_ADDRESS);

    console.log(`--- CONTRACT STATUS ---`);
    console.log(`Current Epoch: ${await nft.currentEpoch()}`);
    console.log(`Next License ID: ${await nft.nextLicenseId()}`);
    console.log(`Total Distributed: ${ethers.formatEther(await nft.totalDistributed())}`);
    console.log(`Contract Balance: ${ethers.formatEther(await ethers.provider.getBalance(CONTRACT_ADDRESS))}`);
    
    const id = 1;
    console.log(`--- NODE #1 ---`);
    console.log(`Last Claimed: ${await nft.lastClaimedEpoch(id)}`);
    console.log(`Tier: ${await nft.tierOf(id)}`);
    console.log(`Active: ${await nft.licenseActive(id)}`);
    
    const reward = await nft.rewardPerEpoch(await nft.tierOf(id));
    console.log(`Reward for this Tier: ${ethers.formatEther(reward)} DNR`);
}

main().catch(console.error);
