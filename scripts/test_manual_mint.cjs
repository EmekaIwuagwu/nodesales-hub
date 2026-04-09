const { ethers } = require('hardhat');

async function main() {
    const PAIR_ADDR   = "0x4211654d90e08fa8d3358B4689947fe83a9AC0dD";
    const MDUSD_ADDR  = "0x24751084393DD93E1fa86d7A0a5Dbb3dba9f80aE";
    const WDNR_ADDR   = "0x352cE5ff75723216AABa5E153112c5A66A3F2392";
    
    const [deployer] = await ethers.getSigners();
    console.log("Testing Manual Mint from:", deployer.address);

    const pair  = await ethers.getContractAt("KortanaPair", PAIR_ADDR);
    const mdusd = await ethers.getContractAt("mdUSD", MDUSD_ADDR);
    const wdnr  = await ethers.getContractAt("WDNR", WDNR_ADDR);

    const amount = ethers.parseUnits("1.0", 18);

    console.log("1. Sending mdUSD directly to Pair...");
    await (await mdusd.transfer(PAIR_ADDR, amount)).wait();
    console.log("✅ Sent.");

    console.log("2. Wrapping DNR and sending to Pair...");
    await (await wdnr.deposit({ value: amount })).wait();
    await (await wdnr.transfer(PAIR_ADDR, amount)).wait();
    console.log("✅ Sent.");

    console.log("3. Calling pair.mint()...");
    try {
        const tx = await pair.mint(deployer.address, { gasLimit: 500000, type: 0 });
        const receipt = await tx.wait();
        console.log("✅ MANUAL MINT SUCCESS in block", receipt.blockNumber);
    } catch (e) {
        console.error("❌ MANUAL MINT FAILED!");
        console.error(e.message);
    }
}

main().catch(console.error);
