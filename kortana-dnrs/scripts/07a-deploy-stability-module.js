import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying StabilityModule with the account:", deployer.address);

  const deploymentsPath = path.join(__dirname, "../deployments.json");
  if (!fs.existsSync(deploymentsPath)) {
    throw new Error("No previous deployments found.");
  }
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const network = hre.network.name;
  
  const dnrsAddress = deployments[network]?.DNRSToken;
  if (!dnrsAddress) {
    throw new Error("DNRSToken not found in deployments.");
  }

  const StabilityModule = await hre.ethers.getContractFactory("StabilityModule");
  console.log("Deploying StabilityModule with 5M gas limit...");
  const module = await StabilityModule.deploy(dnrsAddress, deployer.address, { gasLimit: 5000000 });
  await module.waitForDeployment();
  const moduleAddress = await module.getAddress();

  console.log("StabilityModule deployed to:", moduleAddress);

  // Fund with some native DNR
  const amountToFund = hre.ethers.parseEther("1000");
  console.log("Funding StabilityModule with 1000 Native DNR...");
  await (await deployer.sendTransaction({
    to: moduleAddress,
    value: amountToFund,
    gasLimit: 100000
  })).wait();
  console.log("StabilityModule funded with native DNR.");

  deployments[network].StabilityModule = moduleAddress;
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
