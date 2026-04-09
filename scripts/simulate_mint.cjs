const { ethers } = require('hardhat');

async function main() {
    const ROUTER_ADDR  = "0xe636dd1dcC9f8Dc73b87B1A52d50E182446413b4";
    const MDUSD_ADDR   = "0x24751084393DD93E1fa86d7A0a5Dbb3dba9f80aE";
    
    const [deployer] = await ethers.getSigners();
    console.log("Simulating AddLiquidity from Deployer:", deployer.address);

    const router = await ethers.getContractAt("KortanaRouter", ROUTER_ADDR);
    const mdusd  = await ethers.getContractAt("mdUSD", MDUSD_ADDR);

    const amountMDUSD = ethers.parseEther("1");
    const amountDNR   = ethers.parseEther("1");

    console.log("Step 1: Approving mdUSD...");
    await (await mdusd.approve(ROUTER_ADDR, amountMDUSD)).wait();
    console.log("✅ Approved.");

    console.log("Step 2: Adding Liquidity...");
    try {
        const tx = await router.addLiquidityDNR(
            MDUSD_ADDR,
            amountMDUSD,
            0n, // Min mdUSD
            0n, // Min DNR
            deployer.address,
            Math.floor(Date.now() / 1000) + 600,
            { value: amountDNR, gasLimit: 1000000, type: 0 }
        );
        console.log("🚀 Transaction Sent! Hash:", tx.hash);
        const receipt = await tx.wait();
        console.log("✅ SUCCESS! Liquidity added in block", receipt.blockNumber);
    } catch (e) {
        console.error("❌ SIMULATION FAILED!");
        console.error("Error Message:", e.message);
        if (e.data) console.error("Error Data:", e.data);
    }
}

main().catch(console.error);
