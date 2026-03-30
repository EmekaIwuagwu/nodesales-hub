import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const CONTRACT_ADDRESS = "0x60dD3Caa3Cf48C786f8bb6DD18946e18564bF7F2";
    const TARGET_WALLET = "0x5A0f90EB1CC1154b237EE7c0941391Ee1757051D";
    const NFT = await ethers.getContractFactory("KortanaLicenseNFT");
    const nft = NFT.attach(CONTRACT_ADDRESS);

    console.log(`Checking licenses for ${TARGET_WALLET}...`);
    const licenses = await nft.getLicenses(TARGET_WALLET);
    console.log(`Node IDs found: ${licenses}`);

    for (let id of licenses) {
        const lastClaimed = await nft.lastClaimedEpoch(id);
        const tier = await nft.tierOf(id);
        console.log(`Node ID #${id}: Tier ${tier}, Last Claimed Epoch: ${lastClaimed}`);
    }
}

main().catch(console.error);
