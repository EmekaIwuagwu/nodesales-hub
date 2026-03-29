import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    // Determine the parameters passed to the script
    // Usage: npx hardhat run scripts/mint.js --network mainnet
    // Or set env flags, e.g., BUYER="0x..." TIER="0" npx hardhat run scripts/mint.js
    
    let buyer = process.env.BUYER;
    let tierStr = process.env.TIER;

    // Hardcode fallback for easy testing if you prefer editing the file
    if (!buyer) buyer = "0x0000000000000000000000000000000000000000"; 
    if (!tierStr) tierStr = "0"; // 0: Genesis, 1: Early, 2: Full, 3: Premium

    const tier = parseInt(tierStr);

    console.log(`\n==============================================`);
    console.log(`⬡ INIT KORTANA LICENSE MINT`);
    console.log(`==============================================`);
    console.log(`Buyer Address : ${buyer}`);
    console.log(`Tier Assigned : ${tier} (0=Genesis, 1=Early, 2=Full, 3=Premium)`);

    if (buyer === "0x0000000000000000000000000000000000000000") {
        console.error("\n❌ ERROR: Invalid Buyer Address");
        console.error("Please run the script by passing the BUYER and TIER variables.");
        console.error("Example: BUYER=0xYourBuyerAddress TIER=0 npx hardhat run scripts/mint.js --network testnet\n");
        process.exit(1);
    }

    const [deployer] = await ethers.getSigners();
    console.log(`Executing from Foundation Wallet: ${deployer.address}`);

    const nftAddress = process.env.NFT_ADDRESS;
    if (!nftAddress || nftAddress.includes("_")) {
        console.error("\n❌ ERROR: NFT_ADDRESS is not set correctly in your .env file.\n");
        process.exit(1);
    }

    // Attach to the deployed contract
    const NFT = await ethers.getContractFactory("KortanaLicenseNFT");
    const nft = NFT.attach(nftAddress);

    console.log(`\n⏳ Submitting Mint Transaction to the Blockchain...`);
    
    try {
        // Enforce legacy structure to avoid EIP-1559 RPC formatting errors on Kortana
        const tx = await nft.mintLicense(buyer, tier, { gasLimit: 2000000, gasPrice: ethers.parseUnits("1", "gwei"), type: 0 });
        console.log(`✅ Transaction sent! TX Hash: ${tx.hash}`);
        
        console.log(`⏳ Waiting for block confirmation...`);
        const receipt = await tx.wait();
        
        console.log(`\n🎉 SUCCESS! License minted to ${buyer} inside Block #${receipt.blockNumber}`);
        console.log(`Gas Used: ${receipt.gasUsed.toString()}`);
    } catch (error) {
        console.error(`\n❌ TRANSACTION FAILED:`, error.reason || error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
