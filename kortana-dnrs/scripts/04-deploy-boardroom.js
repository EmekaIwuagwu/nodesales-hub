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
    throw new Error("DNRSToken not found. Please deploy DNRSToken first.");
  }
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const network = hre.network.name;
  
  const dnrsTokenAddress = deployments[network]?.DNRSToken;
  if (!dnrsTokenAddress) throw new Error("DNRSToken not found for network: " + network);

  let dnrTokenAddress = process.env.DNR_TOKEN;
  
  if (!dnrTokenAddress) {
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const mockDNR = await MockERC20.deploy("Dinar", "DNR", 18, { gasLimit: 5000000 });
    await mockDNR.waitForDeployment();
    dnrTokenAddress = await mockDNR.getAddress();
    console.log("MockDNR deployed to:", dnrTokenAddress);
    deployments[network].MockDNR = dnrTokenAddress;
  }

  const BoardroomStaking = await hre.ethers.getContractFactory("BoardroomStaking");
  const boardroom = await BoardroomStaking.deploy(dnrTokenAddress, dnrsTokenAddress, deployer.address, { gasLimit: 5000000 });

  await boardroom.waitForDeployment();
  const boardroomAddress = await boardroom.getAddress();

  console.log("BoardroomStaking deployed to:", boardroomAddress);

  deployments[network].BoardroomStaking = boardroomAddress;
  
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
