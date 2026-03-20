import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const DNRSToken = await ethers.getContractFactory("DNRSToken");
  const dnrs = await DNRSToken.deploy("0x0000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000001");
  await dnrs.waitForDeployment();
  console.log("Contract instance keys:", Object.keys(dnrs));
  console.log("Is mint in contract:", "mint" in dnrs);
  console.log("Interface fragments:", dnrs.interface.fragments.map(f => f.name));
}

main();
