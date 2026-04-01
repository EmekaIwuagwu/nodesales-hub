import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const CONTRACT_ADDRESS = "0x2333B951635Ce16A452BbeE8034AFbfA081Da856";
    const NFT = await ethers.getContractFactory("KortanaLicenseNFT");
    const nft = NFT.attach(CONTRACT_ADDRESS);

    const id = 1;
    const owner = await nft.ownerOf(id);
    console.log(`Node #1 Owner: ${owner}`);
    
    const hexBal = await ethers.provider.send("eth_getBalance", [owner, "latest"]);
    const bal = ethers.formatEther(hexBal);
    console.log(`Owner Balance: ${bal} DNR`);
}

main().catch(console.error);
