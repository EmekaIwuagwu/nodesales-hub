import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
    const [deployer] = await ethers.getSigners();
    const USER = "0x5A0f90EB1CC1154b237EE7c0941391Ee1757051D";

    const Factory = await ethers.getContractFactory("ETHSenderTest2");
    const c = await Factory.deploy({ type: 0, gasLimit: 500000, gasPrice: ethers.parseUnits("1", "gwei") });
    await c.waitForDeployment();
    const addr = await c.getAddress();
    console.log("Deployed ETHSenderTest2 at:", addr);

    await (await deployer.sendTransaction({ to: addr, value: ethers.parseEther("100"), type: 0, gasLimit: 50000, gasPrice: ethers.parseUnits("1", "gwei") })).wait();
    console.log("Funded");

    const balBefore = await ethers.provider.getBalance(USER);

    // Test 1: call{value} without gas param
    console.log("\nTest A: call{value} no gas param...");
    try {
        const r = await (await c.sendTo(USER, ethers.parseEther("5"), { type: 0, gasLimit: 500000, gasPrice: ethers.parseUnits("1", "gwei") })).wait();
        console.log(`SUCCESS — Gas: ${r.gasUsed}`);
    } catch(e) { console.log(`FAIL — Gas: ${e.receipt?.gasUsed}`); }

    // Test 2: transfer()
    console.log("Test B: transfer()...");
    try {
        const r = await (await c.transferTo(USER, ethers.parseEther("5"), { type: 0, gasLimit: 500000, gasPrice: ethers.parseUnits("1", "gwei") })).wait();
        console.log(`SUCCESS — Gas: ${r.gasUsed}`);
    } catch(e) { console.log(`FAIL — Gas: ${e.receipt?.gasUsed}`); }

    const balAfter = await ethers.provider.getBalance(USER);
    console.log(`\nUser received total: +${ethers.formatEther(balAfter - balBefore)} DNR`);
}
main().catch(console.error);
