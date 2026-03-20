import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const initialPrice = process.env.INITIAL_DNRS_PRICE || "1000000000000000000";
  console.log("Initial DNRS Price:", initialPrice);

  const PriceOracle = await hre.ethers.getContractFactory("PriceOracle");
  console.log("Deploying with 5M gas limit...");
  const oracle = await PriceOracle.deploy(initialPrice, deployer.address, { gasLimit: 5000000 });

  console.log("Waiting for deployment...");
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();

  console.log("PriceOracle deployed to:", oracleAddress);

  const deploymentsPath = path.join(__dirname, "../deployments.json");
  let deployments = {};
  if (fs.existsSync(deploymentsPath)) {
    deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  }
  
  const network = hre.network.name;
  if (!deployments[network]) deployments[network] = {};
  deployments[network].PriceOracle = oracleAddress;
  
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
