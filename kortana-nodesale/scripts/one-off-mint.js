import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const CONTRACT_ADDRESS = "0xd31303e73A0601D6785E9516692D4A8eB8fA0A99B";
    const BUYER = "0x5A0f90EB1CC1154b237EE7c0941391Ee1757051D";
    const TIER = 0;

    const [deployer] = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("KortanaLicenseNFT");
    const nft = NFT.attach(CONTRACT_ADDRESS);

    console.log(`Minting Tier ${TIER} to ${BUYER}...`);
    const tx = await nft.mintLicense(BUYER, TIER, { gasLimit: 2000000, type: 0 });
    await tx.wait();
    console.log("Success!");
}

main().catch(console.error);
