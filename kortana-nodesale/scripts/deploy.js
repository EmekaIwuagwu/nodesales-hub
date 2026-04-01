import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log(`===========================================`);
    console.log(`⬡ KORTANA UNIFIED DEPLOYMENT PROTOCOL`);
    console.log(`===========================================`);
    console.log("💳 Deployer:", deployer.address);
    console.log("💰 Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

    // 1. Deploy DNR ERC20 Token (1 billion supply to deployer)
    console.log("\n🚀 [1/2] Deploying DNRToken (ERC20)...");
    const DNR = await ethers.getContractFactory("DNRToken");
    const dnr = await DNR.deploy(
        ethers.parseEther("1000000000"), // 1 billion DNR
        { type: 0, gasLimit: 3000000, gasPrice: ethers.parseUnits("1", "gwei") }
    );
    await dnr.waitForDeployment();
    const dnrAddress = await dnr.getAddress();
    console.log(`✅ DNRToken deployed at: ${dnrAddress}`);

    // 2. Deploy KortanaLicenseNFT with the DNR token address
    console.log("\n🚀 [2/2] Deploying KortanaLicenseNFT...");
    const NFT = await ethers.getContractFactory("KortanaLicenseNFT");
    const nft = await NFT.deploy(
        dnrAddress,
        { type: 0, gasLimit: 5000000, gasPrice: ethers.parseUnits("1", "gwei") }
    );
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();
    console.log(`✅ KortanaLicenseNFT deployed at: ${nftAddress}`);

    console.log(`\n🎉=======================================🎉`);
    console.log(`📡 DEPLOYMENT COMPLETE`);
    console.log(`🪙  DNR Token  : ${dnrAddress}`);
    console.log(`🎯  NFT License: ${nftAddress}`);
    console.log(`🎉=======================================🎉`);
    console.log(`\n⚠️  NEXT STEPS:`);
    console.log(`1. Set DNR_ADDRESS=${dnrAddress} in your .env files`);
    console.log(`2. Set NFT_ADDRESS=${nftAddress} in your .env files`);
    console.log(`3. Run fund-contract.js to transfer DNR tokens into the NFT contract treasury`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
