import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const CONTRACT_ADDRESS = "0x2333B951635Ce16A452BbeE8034AFbfA081Da856";
    const USER_ADDRESS = "0x5A0f90EB1CC1154b237EE7c0941391Ee1757051D";
    
    console.log(`--- LIVE BALANCE AUDIT ---`);
    const cBal = await ethers.provider.getBalance(CONTRACT_ADDRESS);
    const uBal = await ethers.provider.getBalance(USER_ADDRESS);
    
    console.log(`Contract: ${ethers.formatEther(cBal)} DNR`);
    console.log(`User    : ${ethers.formatEther(uBal)} DNR`);
    
    const NFT = await ethers.getContractFactory("KortanaLicenseNFT");
    const nft = NFT.attach(CONTRACT_ADDRESS);
    console.log(`Total Distributed reported by Contract: ${ethers.formatEther(await nft.totalDistributed())} DNR`);
}

main().catch(console.error);
