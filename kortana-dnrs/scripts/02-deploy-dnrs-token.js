import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const DNRSToken = await hre.ethers.getContractFactory("DNRSToken");
  console.log("Deploying with 5M gas limit...");
  const dnrsToken = await DNRSToken.deploy(deployer.address, deployer.address, { gasLimit: 5000000 });

  await dnrsToken.waitForDeployment();
  const dnrsTokenAddress = await dnrsToken.getAddress();

  console.log("DNRSToken deployed to:", dnrsTokenAddress);

  const deploymentsPath = path.join(__dirname, "../deployments.json");
  let deployments = {};
  if (fs.existsSync(deploymentsPath)) {
    deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  }
  
  const network = hre.network.name;
  if (!deployments[network]) deployments[network] = {};
  deployments[network].DNRSToken = dnrsTokenAddress;
  
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
