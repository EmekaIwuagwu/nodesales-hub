import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
    const [deployer] = await ethers.getSigners();
    const USER = "0x5A0f90EB1CC1154b237EE7c0941391Ee1757051D";

    console.log("Deploying ETHSenderTest on TESTNET...");
    const Factory = await ethers.getContractFactory("ETHSenderTest");
    const contract = await Factory.deploy({ type: 0, gasLimit: 500000, gasPrice: ethers.parseUnits("1", "gwei") });
    await contract.waitForDeployment();
    const addr = await contract.getAddress();
    console.log("Deployed at:", addr);

    const fundTx = await deployer.sendTransaction({ to: addr, value: ethers.parseEther("100"), type: 0, gasLimit: 50000, gasPrice: ethers.parseUnits("1", "gwei") });
    await fundTx.wait();
    console.log("Funded with 100 DNR");

    const balBefore = await ethers.provider.getBalance(USER);
    console.log("User balance before:", ethers.formatEther(balBefore));

    console.log("Calling sendTo(user, 10 DNR) with 500k gas...");
    const tx = await contract.sendTo(USER, ethers.parseEther("10"), { type: 0, gasLimit: 500000, gasPrice: ethers.parseUnits("1", "gwei") });
    const receipt = await tx.wait();
    console.log(`Status: ${receipt.status} | Gas used: ${receipt.gasUsed}`);

    const balAfter = await ethers.provider.getBalance(USER);
    console.log(`User received: +${ethers.formatEther(balAfter - balBefore)} DNR`);
}
main().catch(console.error);
