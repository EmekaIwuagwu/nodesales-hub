const { ethers } = require('hardhat');

async function main() {
    const PAIR_ADDR    = "0x4211654d90e08fa8d3358B4689947fe83a9AC0dD";
    const REAL_FACTORY = "0x306Ff98Caa25Fee776dDF7a0D00EB2514B1Da2c6";
    
    const [deployer] = await ethers.getSigners();
    console.log("Correcting Pair Factory from Deployer:", deployer.address);

    const pair = await ethers.getContractAt("KortanaPair", PAIR_ADDR);

    console.log("Current Factory in Pair:", await pair.factory());
    console.log("Setting to REAL Factory :", REAL_FACTORY);

    const tx = await pair.setFactory(REAL_FACTORY, { type: 0 });
    console.log("Tx Sent! Hash:", tx.hash);
    await tx.wait();

    console.log("✅ PAIR FACTORY CORRECTED!");
}

main().catch(console.error);
