import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const deploymentsPath = path.join(__dirname, "../deployments.json");
  if (!fs.existsSync(deploymentsPath)) {
    throw new Error("No previous deployments found.");
  }
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const network = hre.network.name;
  
  const dnrsAddress = deployments[network]?.DNRSToken;
  const dnrBondAddress = deployments[network]?.DNRBond;
  const boardroomAddress = deployments[network]?.BoardroomStaking;
  const oracleAddress = deployments[network]?.PriceOracle;
  
  if (!dnrsAddress || !dnrBondAddress || !boardroomAddress || !oracleAddress) {
    throw new Error("One or more required contracts not found in deployments.json.");
  }

  const devFund = process.env.DEV_FUND_ADDRESS || deployer.address;
  const startTimeDelay = parseInt(process.env.TREASURY_START_DELAY || "3600");
  const startTime = Math.floor(Date.now() / 1000) + startTimeDelay;

  console.log("Dev Fund:", devFund);
  console.log("Start Time:", startTime, `(in ${startTimeDelay} seconds)`);

  const Treasury = await hre.ethers.getContractFactory("Treasury");
  console.log("Deploying Treasury with 5M gas limit...");
  const treasury = await Treasury.deploy(
    dnrsAddress,
    dnrBondAddress,
    boardroomAddress,
    oracleAddress,
    devFund,
    startTime,
    deployer.address,
    { gasLimit: 5000000 }
  );

  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();

  console.log("Treasury deployed to:", treasuryAddress);

  deployments[network].Treasury = treasuryAddress;
  
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
