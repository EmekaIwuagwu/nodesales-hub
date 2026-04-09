import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const block = await ethers.provider.getBlock("latest");
  console.log("Block gas limit:", block?.gasLimit.toString());
  console.log("Block number:", block?.number);

  // also check KortanaPair bytecode size
  const factory = await ethers.getContractFactory("KortanaPair");
  const bytecode = factory.bytecode;
  console.log("\nKortanaPair bytecode size:", bytecode.length / 2 - 1, "bytes");

  const pairFactory = await ethers.getContractFactory("KortanaFactory");
  console.log("KortanaFactory bytecode size:", pairFactory.bytecode.length / 2 - 1, "bytes");

  const routerFactory = await ethers.getContractFactory("KortanaRouter");
  console.log("KortanaRouter bytecode size:", routerFactory.bytecode.length / 2 - 1, "bytes");
}

main().catch(e => { console.error(e); process.exit(1); });
