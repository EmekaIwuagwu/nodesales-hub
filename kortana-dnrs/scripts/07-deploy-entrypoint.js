import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying EntryPoint with the account:", deployer.address);

  const deploymentsPath = path.join(__dirname, "../deployments.json");
  let deployments = {};
  if (fs.existsSync(deploymentsPath)) {
    deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  }
  const network = hre.network.name;
  
  if (deployments[network]?.EntryPoint) {
    console.log("EntryPoint already deployed to:", deployments[network].EntryPoint);
    return;
  }

  const EntryPoint = await hre.ethers.getContractFactory("MockEntryPoint");
  console.log("Deploying EntryPoint with 5M gas limit...");
  const entryPoint = await EntryPoint.deploy({ gasLimit: 5000000 });
  await entryPoint.waitForDeployment();
  const entryPointAddress = await entryPoint.getAddress();

  console.log("EntryPoint (Mock) deployed to:", entryPointAddress);

  if (!deployments[network]) deployments[network] = {};
  deployments[network].EntryPoint = entryPointAddress;
  
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
