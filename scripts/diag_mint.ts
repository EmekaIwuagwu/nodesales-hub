/**
 * diag_mint.ts — test pair.mint() with progressively more gas to find the threshold
 */
import pkg from "hardhat";
const { ethers } = pkg;

const MDUSD   = "0x24751084393DD93E1fa86d7A0a5Dbb3dba9f80aE";
const WDNR    = "0x352cE5ff75723216AABa5E153112c5A66A3F2392";
const FACTORY = "0x306Ff98Caa25Fee776dDF7a0D00EB2514B1Da2c6";

const iface = new ethers.Interface([
  "function getPair(address,address) view returns (address)",
  "function balanceOf(address) view returns (uint256)",
  "function deposit() payable external",
  "function transfer(address,uint256) external returns (bool)",
  "function mint(address) external returns (uint256)",
  "function getReserves() view returns (uint112,uint112,uint32)",
  "function feeTo() view returns (address)",
]);

async function callView(provider: any, to: string, fn: string, args: any[]) {
  const data = iface.encodeFunctionData(fn, args);
  const result = await provider.call({ to, data });
  return iface.decodeFunctionResult(fn, result);
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const [pairAddr] = await callView(ethers.provider, FACTORY, "getPair", [MDUSD, WDNR]);
  console.log("Pair:", pairAddr);

  // Ensure pair has tokens (send a fresh batch)
  console.log("Sending tokens to pair...");
  const SMALL_DNR   = ethers.parseEther("1");
  const SMALL_TOKEN = ethers.parseEther("10");

  // deposit DNR → WDNR
  let tx = await deployer.sendTransaction({
    to: WDNR,
    data: iface.encodeFunctionData("deposit", []),
    value: SMALL_DNR, gasLimit: 200000n, gasPrice: 1n
  });
  await tx.wait();

  // transfer WDNR to pair
  tx = await deployer.sendTransaction({
    to: WDNR,
    data: iface.encodeFunctionData("transfer", [pairAddr, SMALL_DNR]),
    gasLimit: 200000n, gasPrice: 1n
  });
  await tx.wait();

  // transfer mdUSD to pair
  const mdIface = new ethers.Interface(["function transfer(address,uint256) external returns (bool)"]);
  tx = await deployer.sendTransaction({
    to: MDUSD,
    data: mdIface.encodeFunctionData("transfer", [pairAddr, SMALL_TOKEN]),
    gasLimit: 200000n, gasPrice: 1n
  });
  await tx.wait();

  const [pairWdnr] = await callView(ethers.provider, WDNR, "balanceOf", [pairAddr]);
  const [pairMdusd] = await callView(ethers.provider, MDUSD, "balanceOf", [pairAddr]);
  console.log("Pair WDNR:", ethers.formatEther(pairWdnr));
  console.log("Pair mdUSD:", ethers.formatEther(pairMdusd));

  // Check factory.feeTo() works
  console.log("Checking factory.feeTo()...");
  const [feeTo] = await callView(ethers.provider, FACTORY, "feeTo", []);
  console.log("feeTo:", feeTo);

  // Try mint with various gas limits
  for (const gasLimit of [500000n, 900000n, 2000000n, 5000000n, 10000000n]) {
    console.log(`\n--- Trying pair.mint() with gasLimit=${gasLimit} ---`);
    try {
      const mintTx = await deployer.sendTransaction({
        to: pairAddr,
        data: iface.encodeFunctionData("mint", [deployer.address]),
        gasLimit,
        gasPrice: 1n,
      });
      const receipt = await mintTx.wait();
      if (receipt.status === 1) {
        console.log(`✅ SUCCESS! gasUsed: ${receipt.gasUsed}`);

        const lpIface = new ethers.Interface(["function balanceOf(address) view returns (uint256)"]);
        const lpBal = lpIface.decodeFunctionResult("balanceOf",
          await ethers.provider.call({ to: pairAddr, data: lpIface.encodeFunctionData("balanceOf", [deployer.address]) })
        )[0];
        console.log("LP balance:", ethers.formatEther(lpBal));
        process.exit(0);
      } else {
        console.log(`❌ reverted, gasUsed: ${receipt.gasUsed}`);
      }
    } catch (e: any) {
      // parse gasUsed from error if present
      const used = e?.receipt?.gasUsed?.toString() ?? "unknown";
      console.log(`❌ threw: gasUsed=${used} — ${e.shortMessage ?? e.message?.slice(0,100)}`);
    }
  }
  console.log("\nAll attempts failed.");
}

main().catch(e => { console.error(e); process.exit(1); });
