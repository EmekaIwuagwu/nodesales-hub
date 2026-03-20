import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Funding Paymaster with the account:", deployer.address);

  const deploymentsPath = path.join(__dirname, "../deployments.json");
  if (!fs.existsSync(deploymentsPath)) {
    throw new Error("No previous deployments found.");
  }
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const network = hre.network.name;
  
  const paymasterAddress = deployments[network]?.DNRSPaymaster;
  if (!paymasterAddress) {
    throw new Error("DNRSPaymaster not found in deployments.json.");
  }

  const DNRSPaymaster = await hre.ethers.getContractAt("DNRSPaymaster", paymasterAddress);
  
  const depositAmount = hre.ethers.parseEther(process.env.PAYMASTER_DEPOSIT_AMOUNT || "10");
  const stakeAmount = hre.ethers.parseEther(process.env.PAYMASTER_STAKE_AMOUNT || "1");
  const unstakeDelay = parseInt(process.env.PAYMASTER_UNSTAKE_DELAY || "86400");

  console.log(`Depositing ${hre.ethers.formatEther(depositAmount)} DNR to EntryPoint...`);
  await (await DNRSPaymaster.deposit({ value: depositAmount, gasLimit: 500000 })).wait();

  console.log(`Staking ${hre.ethers.formatEther(stakeAmount)} DNR in EntryPoint...`);
  await (await DNRSPaymaster.addStake(unstakeDelay, { value: stakeAmount, gasLimit: 500000 })).wait();

  console.log("Paymaster funded and staked successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
