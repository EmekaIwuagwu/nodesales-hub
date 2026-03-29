import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance));

    // Deploy NFT
    const NFT = await ethers.getContractFactory("KortanaLicenseNFT");
    const nft = await NFT.deploy({ gasLimit: 5000000, gasPrice: ethers.parseUnits("1", "gwei") });
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();
    console.log("KortanaLicenseNFT deployed to:", nftAddress);

    // Deploy Rewards
    const Rewards = await ethers.getContractFactory("KortanaRewards");
    const rewards = await Rewards.deploy(nftAddress, { gasLimit: 5000000, gasPrice: ethers.parseUnits("1", "gwei") });
    await rewards.waitForDeployment();
    const rewardsAddress = await rewards.getAddress();
    console.log("KortanaRewards deployed to:", rewardsAddress);

    console.log("\nDeployment Summary:");
    console.log("-------------------");
    console.log("NFT Address:", nftAddress);
    console.log("Rewards Address:", rewardsAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
