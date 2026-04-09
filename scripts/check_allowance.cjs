const { ethers } = require('hardhat');

async function main() {
    const MDUSD_ADDR = "0x24751084393DD93E1fa86d7A0a5Dbb3dba9f80aE";
    const NEW_ROUTER = "0xe636dd1dcC9f8Dc73b87B1A52d50E182446413b4";
    const USER_ADDR  = "0xf251038d1dB96Ce1a733Ae92247E0A6F400F275E"; // From your screenshot

    const mdusd = await ethers.getContractAt([
        "function allowance(address owner, address spender) view returns (uint256)",
        "function balanceOf(address account) view returns (uint256)"
    ], MDUSD_ADDR);

    try {
        const balance = await mdusd.balanceOf(USER_ADDR);
        const allowance = await mdusd.allowance(USER_ADDR, NEW_ROUTER);

        console.log("--- Allowance Check ---");
        console.log("User mdUSD Balance  :", ethers.formatEther(balance));
        console.log("Allowance for Router:", ethers.formatEther(allowance));

        if (allowance === 0n) {
            console.log("❌ ERROR: You have NOT approved the NEW Router to spend your mdUSD.");
        } else {
            console.log("✅ Allowance is set.");
        }
    } catch (e) {
        console.error("❌ Failed to check allowance:", e);
    }
}

main().catch(console.error);
