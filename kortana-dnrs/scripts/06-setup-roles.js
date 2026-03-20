import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Setting up roles with the account:", deployer.address);

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
  const treasuryAddress = deployments[network]?.Treasury;
  
  if (!dnrsAddress || !dnrBondAddress || !boardroomAddress || !oracleAddress || !treasuryAddress) {
    throw new Error("One or more required contracts not found in deployments.json.");
  }

  const DNRSToken = await hre.ethers.getContractAt("DNRSToken", dnrsAddress);
  const DNRBond = await hre.ethers.getContractAt("DNRBond", dnrBondAddress);
  const BoardroomStaking = await hre.ethers.getContractAt("BoardroomStaking", boardroomAddress);
  const PriceOracle = await hre.ethers.getContractAt("PriceOracle", oracleAddress);
  const Treasury = await hre.ethers.getContractAt("Treasury", treasuryAddress);

  const TREASURY_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("TREASURY_ROLE"));
  const OPERATOR_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("OPERATOR_ROLE"));
  const PRICE_UPDATER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("PRICE_UPDATER_ROLE"));
  const GUARDIAN_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("GUARDIAN_ROLE"));

  const txOptions = { gasLimit: 500000 }; // 500k should be enough for grantRole

  console.log("Granting roles to Treasury...");
  await (await DNRSToken.grantRole(TREASURY_ROLE, treasuryAddress, txOptions)).wait();
  await (await DNRBond.grantRole(TREASURY_ROLE, treasuryAddress, txOptions)).wait();
  await (await BoardroomStaking.grantRole(TREASURY_ROLE, treasuryAddress, txOptions)).wait();
  console.log("Treasury roles granted.");

  console.log("Granting roles to dev addresses...");
  const devAddress = process.env.DEV_FUND_ADDRESS || deployer.address;
  
  await (await DNRSToken.grantRole(OPERATOR_ROLE, devAddress, txOptions)).wait();
  await (await PriceOracle.grantRole(PRICE_UPDATER_ROLE, devAddress, txOptions)).wait();
  await (await PriceOracle.grantRole(OPERATOR_ROLE, devAddress, txOptions)).wait();
  await (await Treasury.grantRole(OPERATOR_ROLE, devAddress, txOptions)).wait();
  await (await Treasury.grantRole(GUARDIAN_ROLE, devAddress, txOptions)).wait();
  
  console.log("All roles granted successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
