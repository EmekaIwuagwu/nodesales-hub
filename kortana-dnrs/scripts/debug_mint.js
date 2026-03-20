import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const signers = await ethers.getSigners();
  const admin = signers[0];
  const dnrs = await ethers.deployContract("DNRSToken", [admin.address, admin.address], { signer: admin });
  await dnrs.waitForDeployment();
  
  const TREASURY_ROLE = ethers.keccak256(ethers.toUtf8Bytes("TREASURY_ROLE"));
  await dnrs.grantRole(TREASURY_ROLE, admin.address);
  
  console.log("Calling mint...");
  try {
    const tx = await dnrs.mint(admin.address, ethers.parseEther("1000"));
    await tx.wait();
    console.log("Mint successful!");
  } catch (err) {
    console.log("Mint FAILED:", err.message);
  }
}

main();
