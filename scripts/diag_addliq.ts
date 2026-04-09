/**
 * diag_addliq.ts — step-by-step diagnosis of addLiquidityDNR failure
 */
import pkg from "hardhat";
const { ethers } = pkg;

const MDUSD   = "0x24751084393DD93E1fa86d7A0a5Dbb3dba9f80aE";
const WDNR    = "0x352cE5ff75723216AABa5E153112c5A66A3F2392";
const FACTORY = "0x306Ff98Caa25Fee776dDF7a0D00EB2514B1Da2c6";
const ROUTER  = "0xFb767c2b0b60dA8322686c1a32bA8Fe188Da8825";

const iface = new ethers.Interface([
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) external returns (bool)",
  "function transferFrom(address,address,uint256) external returns (bool)",
  "function transfer(address,uint256) external returns (bool)",
  "function deposit() payable external",
  "function withdraw(uint256) external",
  "function getPair(address,address) view returns (address)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function factory() view returns (address)",
  "function getReserves() view returns (uint112,uint112,uint32)",
  "function mint(address) external returns (uint256)",
]);

async function send(deployer: any, to: string, fn: string, args: any[], value = 0n, gas = 500000n) {
  const data = iface.encodeFunctionData(fn, args);
  console.log(`  → ${fn}(${args.map(a => a.toString()).join(", ")})`);
  const tx = await deployer.sendTransaction({ to, data, value, gasLimit: gas, gasPrice: 1n });
  const receipt = await tx.wait();
  if (receipt.status !== 1) throw new Error(`${fn} REVERTED  gasUsed: ${receipt.gasUsed}`);
  console.log(`  ✓ gasUsed: ${receipt.gasUsed}`);
  return receipt;
}

async function callView(provider: any, to: string, fn: string, args: any[]) {
  const data = iface.encodeFunctionData(fn, args);
  const result = await provider.call({ to, data });
  return iface.decodeFunctionResult(fn, result);
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Check pair is registered
  const [pairAddr] = await callView(ethers.provider, FACTORY, "getPair", [MDUSD, WDNR]);
  console.log("Pair:", pairAddr);
  if (pairAddr === "0x0000000000000000000000000000000000000000") {
    throw new Error("Pair not registered! Run bootstrap_pair.ts first.");
  }

  // Check pair state
  const [tok0] = await callView(ethers.provider, pairAddr, "token0", []);
  const [tok1] = await callView(ethers.provider, pairAddr, "token1", []);
  const [fac]  = await callView(ethers.provider, pairAddr, "factory", []);
  const [r0, r1] = await callView(ethers.provider, pairAddr, "getReserves", []);
  console.log("Pair token0:", tok0);
  console.log("Pair token1:", tok1);
  console.log("Pair factory:", fac);
  console.log("Pair reserves:", r0.toString(), r1.toString());

  // Check balances
  const [mdBal] = await callView(ethers.provider, MDUSD, "balanceOf", [deployer.address]);
  const [wdnrBal] = await callView(ethers.provider, WDNR, "balanceOf", [deployer.address]);
  const [allowance] = await callView(ethers.provider, MDUSD, "allowance", [deployer.address, ROUTER]);
  console.log("mdUSD balance:", ethers.formatEther(mdBal));
  console.log("WDNR balance :", ethers.formatEther(wdnrBal));
  console.log("mdUSD allowance to router:", ethers.formatEther(allowance));

  const SMALL_DNR   = ethers.parseEther("1");
  const SMALL_TOKEN = ethers.parseEther("10");

  // Step A: deposit DNR into WDNR
  console.log("\n=== A: WDNR.deposit() ===");
  await send(deployer, WDNR, "deposit", [], SMALL_DNR, 200000n);
  const [wdnrAfter] = await callView(ethers.provider, WDNR, "balanceOf", [deployer.address]);
  console.log("  WDNR balance now:", ethers.formatEther(wdnrAfter));

  // Step B: transfer WDNR to pair
  console.log("\n=== B: WDNR.transfer(pair) ===");
  await send(deployer, WDNR, "transfer", [pairAddr, SMALL_DNR]);
  const [pairWdnr] = await callView(ethers.provider, WDNR, "balanceOf", [pairAddr]);
  console.log("  Pair WDNR balance:", ethers.formatEther(pairWdnr));

  // Step C: transferFrom mdUSD to pair (requires approval)
  if (allowance < SMALL_TOKEN) {
    console.log("\n=== C0: approve mdUSD ===");
    await send(deployer, MDUSD, "approve", [deployer.address, ethers.parseEther("10000000")]);
  }
  console.log("\n=== C: mdUSD.transferFrom(deployer, pair) ===");
  // Use approve+transfer instead of transferFrom since router isn't the one calling
  await send(deployer, MDUSD, "transfer", [pairAddr, SMALL_TOKEN]);
  const [pairMdusd] = await callView(ethers.provider, MDUSD, "balanceOf", [pairAddr]);
  console.log("  Pair mdUSD balance:", ethers.formatEther(pairMdusd));

  // Step D: pair.mint(deployer)
  console.log("\n=== D: pair.mint(deployer) ===");
  await send(deployer, pairAddr, "mint", [deployer.address], 0n, 500000n);

  const lpIface = new ethers.Interface(["function balanceOf(address) view returns (uint256)", "function totalSupply() view returns (uint256)"]);
  const lpBal = lpIface.decodeFunctionResult("balanceOf",
    await ethers.provider.call({ to: pairAddr, data: lpIface.encodeFunctionData("balanceOf", [deployer.address]) })
  )[0];
  const ts = lpIface.decodeFunctionResult("totalSupply",
    await ethers.provider.call({ to: pairAddr, data: lpIface.encodeFunctionData("totalSupply", []) })
  )[0];

  console.log("\n✅ MINT SUCCEEDED");
  console.log("  LP balance:", ethers.formatEther(lpBal));
  console.log("  LP supply :", ethers.formatEther(ts));
}

main().catch(e => { console.error("\n❌", e.message); process.exit(1); });
