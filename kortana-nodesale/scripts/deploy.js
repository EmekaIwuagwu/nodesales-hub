import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    const [deployer] = await ethers.getSigners();
    
    console.log(`===========================================`);
    console.log(`⬡ EXECUTING OFFICIAL MAINNET LAUNCH PROTOCOL`);
    console.log(`===========================================`);
    console.log("💳 Deploying Unified Architecture with Foundation account:", deployer.address);

    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("💰 Foundation Balance:", ethers.formatEther(balance));

    // Deploy Unified Ecosystem Monolith
    console.log("\n🚀 DEPLOYING MONOLITHIC SMART CONTRACT...");
    const NFT = await ethers.getContractFactory("KortanaLicenseNFT");
    // Explicit Legacy type overrides for Mainnet Zeus-RPC compatibilities
    const nft = await NFT.deploy({ type: 0, gasLimit: 5000000, gasPrice: ethers.parseUnits("1", "gwei") });
    await nft.waitForDeployment();
    
    const targetAddress = await nft.getAddress();
    console.log(`\n🎉=======================================🎉`);
    console.log(`📡 KORTANA UNIFIED SMART CONTRACT DEPLOYED!`);
    console.log(`🎯 Official Mainnet Address: ${targetAddress}`);
    console.log(`🎉=======================================🎉\n`);
    
    console.log(`⚠️ IMPORTANT ACTIONS REQUIRED NEXT ⚠️`);
    console.log(`1. Copy the Official Address above.`);
    console.log(`2. Paste it into your 'admin_panel/.env' as 'NFT_ADDRESS=${targetAddress}'.`);
    console.log(`3. Paste it inside 'scripts/daily-airdrop.js' as 'CONTRACT_ADDRESS'.`);
    console.log(`4. Send some Mainnet DNR to '${targetAddress}' to fuel your daily payouts!`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
