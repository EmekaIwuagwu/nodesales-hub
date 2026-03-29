import hre from "hardhat";
const { ethers } = hre;
async function main() {
    const TARGET = "0x5A0f90EB1CC1154b237EE7c0941391Ee1757051D";
    const bal = await ethers.provider.getBalance(TARGET);
    console.log(`Current Synced RPC Balance: ${ethers.formatEther(bal)} DNR`);
}
main().catch(console.error);
