import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying Paymaster with the account:", deployer.address);

  const deploymentsPath = path.join(__dirname, "../deployments.json");
  if (!fs.existsSync(deploymentsPath)) {
    throw new Error("No previous deployments found.");
  }
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const network = hre.network.name;
  
  const entryPointAddress = deployments[network]?.EntryPoint; 
  const dnrsAddress = deployments[network]?.DNRSToken;
  const stabilityModuleAddress = deployments[network]?.StabilityModule;
  
  if (!entryPointAddress || !dnrsAddress || !stabilityModuleAddress) {
    throw new Error("One or more required contracts not found in deployments.json.");
  }

  const initialRate = process.env.INITIAL_PAYMASTER_RATE || hre.ethers.parseEther("1").toString(); 

  const DNRSPaymaster = await hre.ethers.getContractFactory("DNRSPaymaster");
  console.log("Deploying DNRSPaymaster with 5M gas limit...");
  const paymaster = await DNRSPaymaster.deploy(
    entryPointAddress,
    dnrsAddress,
    stabilityModuleAddress,
    initialRate,
    { gasLimit: 5000000 }
  );

  await paymaster.waitForDeployment();
  const paymasterAddress = await paymaster.getAddress();

  console.log("DNRSPaymaster deployed to:", paymasterAddress);

  deployments[network].DNRSPaymaster = paymasterAddress;
  
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
