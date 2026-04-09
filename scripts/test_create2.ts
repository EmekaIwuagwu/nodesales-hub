/**
 * Test whether CREATE2 works on Kortana at all,
 * and compare with a raw CREATE deployment.
 */
import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Deploy a minimal contract using CREATE (normal deployment)
  // This is a tiny contract that just returns a value
  const MINIMAL_BYTECODE = "0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fd"; // just a stub

  // Try deploying KortanaPair directly (CREATE, not CREATE2)
  console.log("\n--- Testing direct KortanaPair deployment (CREATE) ---");
  const PairFactory = await ethers.getContractFactory("KortanaPair");
  try {
    const pair = await PairFactory.deploy({ gasLimit: 15000000 });
    await pair.waitForDeployment();
    console.log("✅ KortanaPair deployed via CREATE at:", await pair.getAddress());
    console.log("   gasUsed: check receipt");
  } catch (e: any) {
    console.error("❌ KortanaPair CREATE failed:", e?.message?.slice(0, 200));
  }

  // Now test CREATE2 directly with a minimal contract
  console.log("\n--- Testing CREATE2 with minimal bytecode ---");
  // Deploy a minimal contract using CREATE2 via inline assembly
  const TestCreate2 = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
contract MinimalTarget { }
contract TestCreate2 {
  event Deployed(address addr);
  function deploy(bytes32 salt) external returns (address addr) {
    bytes memory bytecode = type(MinimalTarget).creationCode;
    assembly { addr := create2(0, add(bytecode, 32), mload(bytecode), salt) }
    emit Deployed(addr);
  }
}
`;
  console.log("(Skipping inline CREATE2 test — using factory createPair with raw calldata instead)\n");

  // Raw calldata for createPair
  const iface = new ethers.Interface(["function createPair(address,address) external returns (address)"]);
  const MDUSD = "0x371DeB6F2Bce2c9b3de001F4273b22A0abE03025";
  const WDNR  = "0x352cE5ff75723216AABa5E153112c5A66A3F2392";
  const FACTORY = "0x44b573dD1A58a9001056C711AC95c5830CDf840B";

  const calldata = iface.encodeFunctionData("createPair", [MDUSD, WDNR]);
  console.log("createPair calldata:", calldata);
  console.log("Sending raw createPair with 20M gas...");

  const tx = await deployer.sendTransaction({
    to: FACTORY,
    data: calldata,
    gasLimit: 20000000n,
  });
  console.log("Tx sent:", tx.hash);
  const receipt = await tx.wait();
  console.log("Status:", receipt?.status, "gasUsed:", receipt?.gasUsed.toString());

  if (receipt?.status === 1) {
    console.log("✅ createPair SUCCEEDED with", receipt.gasUsed.toString(), "gas");
    const factoryContract = new ethers.Contract(FACTORY, ["function getPair(address,address) view returns (address)"], deployer);
    const pair = await factoryContract.getPair(MDUSD, WDNR);
    console.log("Pair address:", pair);
  } else {
    console.log("❌ createPair FAILED even with 20M gas — CREATE2 may be broken on Kortana");
    console.log("   Trying KortanaPair direct deploy with 20M gas...");
    try {
      const pair = await PairFactory.deploy({ gasLimit: 20000000 });
      await pair.waitForDeployment();
      console.log("✅ Direct CREATE deploy worked! CREATE2 is the problem.");
    } catch (e: any) {
      console.error("❌ Direct deploy also failed:", e?.message?.slice(0, 200));
      console.log("   The EVM has a fundamental contract deployment issue.");
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
