const { ethers } = require("hardhat");

async function main() {
  const KortanaPool = await ethers.getContractFactory("KortanaPool");
  const bytecode = KortanaPool.bytecode;
  const hash = ethers.keccak256(bytecode);
  console.log("KortanaPool Init Code Hash:", hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
