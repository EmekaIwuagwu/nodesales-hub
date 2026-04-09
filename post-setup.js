import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.TESTNET_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const mdUSDAddress = "0x0ABF9D12057BE0c53eF140AA6fB7889C3B13ae11";
  const abi = [
    "function setOperator(address operator, bool status) external",
    "function mint(address to, uint256 amount) external"
  ];

  const mdUSD = new ethers.Contract(mdUSDAddress, abi, wallet);
  const gasOverride = { gasLimit: 1000000 };

  console.log("Setting operator...");
  await (await mdUSD.setOperator(wallet.address, true, gasOverride)).wait();
  console.log("Minting tokens...");
  await (await mdUSD.mint(wallet.address, ethers.parseUnits("1000000", 18), gasOverride)).wait();
  console.log("Finished setup!");
}

main().catch(console.error);
