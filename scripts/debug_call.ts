/**
 * debug_call.ts — diagnose why setOperator fails
 * Forces a high gas limit to bypass estimation bug
 */
import pkg from "hardhat";
const { ethers } = pkg;

const MDUSD_ADDRESS = "0x371DeB6F2Bce2c9b3de001F4273b22A0abE03025";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const iface = new ethers.Interface([
    "function owner() view returns (address)",
    "function isOperator(address) view returns (bool)",
    "function setOperator(address operator, bool status) external",
    "function mint(address to, uint256 amount) external",
    "function balanceOf(address) view returns (uint256)",
  ]);

  // Check gas estimate from node
  const setOpData = iface.encodeFunctionData("setOperator", [deployer.address, true]);
  console.log("calldata:", setOpData);

  try {
    const estimated = await ethers.provider.estimateGas({
      to: MDUSD_ADDRESS,
      from: deployer.address,
      data: setOpData,
    });
    console.log("eth_estimateGas returned:", estimated.toString());
  } catch (e: any) {
    console.log("eth_estimateGas threw:", e?.message);
  }

  // Force high gas limit
  console.log("\nSending setOperator with gasLimit=500000...");
  try {
    const tx = await deployer.sendTransaction({
      to: MDUSD_ADDRESS,
      data: setOpData,
      gasLimit: 500000n,
    });
    console.log("Tx sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("Status:", receipt?.status, "gasUsed:", receipt?.gasUsed.toString());

    if (receipt?.status === 1) {
      // Now mint
      console.log("\nsetOperator succeeded! Now minting...");
      const mintData = iface.encodeFunctionData("mint", [
        deployer.address,
        ethers.parseEther("1000000"),
      ]);
      const mintTx = await deployer.sendTransaction({
        to: MDUSD_ADDRESS,
        data: mintData,
        gasLimit: 500000n,
      });
      const mintReceipt = await mintTx.wait();
      console.log("Mint status:", mintReceipt?.status, "gasUsed:", mintReceipt?.gasUsed.toString());

      const balResult = await ethers.provider.call({
        to: MDUSD_ADDRESS,
        data: iface.encodeFunctionData("balanceOf", [deployer.address]),
      });
      const bal = iface.decodeFunctionResult("balanceOf", balResult)[0];
      console.log("Deployer mdUSD balance:", ethers.formatEther(bal));
    }
  } catch (e: any) {
    console.error("Failed:", e?.message ?? e);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
