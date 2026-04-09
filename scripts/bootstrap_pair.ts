/**
 * bootstrap_pair.ts
 *
 * One-shot setup for KortanaDEX on Kortana testnet.
 * Kortana EVM cannot do CREATE/CREATE2 from within contracts,
 * so we deploy KortanaPair directly via EOA then register it.
 *
 * Steps:
 *   1. Deploy KortanaPair via EOA (raw tx — no contract factory call)
 *   2. pair.initialize(MDUSD, WDNR)      — sets token0/token1
 *   3. pair.setFactory(FACTORY)           — points pair at real factory
 *   4. factory.registerPair(MDUSD, WDNR, pair) — registers the pair
 *   5. mdUSD setOperator(deployer) + mint(deployer, 1M)
 *   6. mdUSD approve(ROUTER, 100)
 *   7. router.addLiquidityDNR(...)        — seeds pool with 10 DNR + 100 mdUSD
 *   8. Print LP balance to confirm success
 *
 * Usage:
 *   npx hardhat run scripts/bootstrap_pair.ts --network kortanaTestnet
 */
import pkg from "hardhat";
const { ethers, artifacts } = pkg;

const MDUSD   = "0x24751084393DD93E1fa86d7A0a5Dbb3dba9f80aE";
const WDNR    = "0x352cE5ff75723216AABa5E153112c5A66A3F2392";
const FACTORY = "0x306Ff98Caa25Fee776dDF7a0D00EB2514B1Da2c6";
const ROUTER  = "0xFb767c2b0b60dA8322686c1a32bA8Fe188Da8825";

const iface = new ethers.Interface([
  // mdUSD
  "function owner() view returns (address)",
  "function isOperator(address) view returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function setOperator(address,bool) external",
  "function mint(address,uint256) external",
  "function approve(address,uint256) external returns (bool)",
  // factory
  "function getPair(address,address) view returns (address)",
  "function registerPair(address,address,address) external",
  // pair
  "function initialize(address,address) external",
  "function setFactory(address) external",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function factory() view returns (address)",
  "function totalSupply() view returns (uint256)",
  // router
  "function addLiquidityDNR(address,uint256,uint256,uint256,address,uint256) payable returns (uint256,uint256,uint256)",
]);

async function send(
  deployer: any,
  to: string,
  fn: string,
  args: any[],
  value = 0n,
  gas = 500000n
) {
  const data = iface.encodeFunctionData(fn, args);
  console.log(`  → ${fn}(${args.map((a) => a.toString()).join(", ")})`);
  const tx = await deployer.sendTransaction({ to, data, value, gasLimit: gas, gasPrice: 1n });
  const receipt = await tx.wait();
  if (receipt.status !== 1) throw new Error(`${fn} reverted! gasUsed: ${receipt.gasUsed}`);
  console.log(`  ✓ confirmed  gasUsed: ${receipt.gasUsed}`);
  return receipt;
}

async function call(provider: any, to: string, fn: string, args: any[]) {
  const data = iface.encodeFunctionData(fn, args);
  const result = await provider.call({ to, data });
  return iface.decodeFunctionResult(fn, result)[0];
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const dnrBal = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer :", deployer.address);
  console.log("DNR bal  :", ethers.formatEther(dnrBal));

  // ── 1. Check if pair already registered ──────────────────────────────────
  console.log("\n=== Step 1: Check existing pair ===");
  const existingPair = await call(ethers.provider, FACTORY, "getPair", [MDUSD, WDNR]);
  let pairAddr: string;

  if (existingPair !== "0x0000000000000000000000000000000000000000") {
    console.log("  Pair already registered:", existingPair);
    pairAddr = existingPair;
  } else {
    // ── 2. Deploy KortanaPair via raw EOA tx ──────────────────────────────
    console.log("\n=== Step 2: Deploy KortanaPair ===");
    const artifact = await artifacts.readArtifact("KortanaPair");
    const deployTx = await deployer.sendTransaction({
      data: artifact.bytecode,
      gasLimit: 3000000n,
      gasPrice: 1n,
    });
    const deployReceipt = await deployTx.wait();
    if (deployReceipt.status !== 1) throw new Error("KortanaPair deploy failed");
    pairAddr = deployReceipt.contractAddress!;
    console.log("  KortanaPair deployed at:", pairAddr);
    console.log("  gasUsed:", deployReceipt.gasUsed.toString());

    // ── 3. initialize(token0, token1) ─────────────────────────────────────
    // EOA is the factory at this point (constructor sets factory = msg.sender)
    console.log("\n=== Step 3: initialize pair ===");
    // Sort tokens the same way the pair/factory does (lower address = token0)
    const [tok0, tok1] = MDUSD.toLowerCase() < WDNR.toLowerCase()
      ? [MDUSD, WDNR]
      : [WDNR, MDUSD];
    await send(deployer, pairAddr, "initialize", [tok0, tok1]);

    // ── 4. setFactory → point at real factory ─────────────────────────────
    console.log("\n=== Step 4: setFactory ===");
    await send(deployer, pairAddr, "setFactory", [FACTORY]);

    // ── 5. registerPair ───────────────────────────────────────────────────
    console.log("\n=== Step 5: registerPair ===");
    await send(deployer, FACTORY, "registerPair", [MDUSD, WDNR, pairAddr]);
    console.log("  Pair registered in factory ✓");
  }

  // ── 6. Fund deployer with mdUSD ──────────────────────────────────────────
  console.log("\n=== Step 6: Fund mdUSD ===");
  const isOp = await call(ethers.provider, MDUSD, "isOperator", [deployer.address]);
  if (!isOp) {
    console.log("  Setting deployer as operator...");
    await send(deployer, MDUSD, "setOperator", [deployer.address, true]);
  } else {
    console.log("  Already operator.");
  }
  const bal = await call(ethers.provider, MDUSD, "balanceOf", [deployer.address]);
  console.log("  Current mdUSD balance:", ethers.formatEther(bal));

  const MINT = ethers.parseEther("1000000");
  await send(deployer, MDUSD, "mint", [deployer.address, MINT]);
  const newBal = await call(ethers.provider, MDUSD, "balanceOf", [deployer.address]);
  console.log("  mdUSD balance after mint:", ethers.formatEther(newBal));

  // ── 7. Approve mdUSD to Router ───────────────────────────────────────────
  console.log("\n=== Step 7: Approve mdUSD → Router ===");
  const AMOUNT_TOKEN = ethers.parseEther("100");
  const allowed = await call(ethers.provider, MDUSD, "allowance", [deployer.address, ROUTER]);
  if (allowed < AMOUNT_TOKEN) {
    await send(deployer, MDUSD, "approve", [ROUTER, ethers.parseEther("10000000")]);
  } else {
    console.log("  Already approved:", ethers.formatEther(allowed));
  }

  // ── 8. addLiquidityDNR (seed pool) ──────────────────────────────────────
  console.log("\n=== Step 8: addLiquidityDNR ===");
  const AMOUNT_DNR   = ethers.parseEther("10");
  const tokenMin     = (AMOUNT_TOKEN * 995n) / 1000n;
  const dnrMin       = (AMOUNT_DNR   * 995n) / 1000n;
  const deadline     = BigInt(Math.floor(Date.now() / 1000) + 1200);

  await send(
    deployer,
    ROUTER,
    "addLiquidityDNR",
    [MDUSD, AMOUNT_TOKEN, tokenMin, dnrMin, deployer.address, deadline],
    AMOUNT_DNR,
    1000000n
  );

  // ── 9. Results ───────────────────────────────────────────────────────────
  const pairIface = new ethers.Interface([
    "function balanceOf(address) view returns (uint256)",
    "function totalSupply() view returns (uint256)",
  ]);
  const [lpBal, ts] = await Promise.all([
    ethers.provider.call({ to: pairAddr, data: pairIface.encodeFunctionData("balanceOf", [deployer.address]) }).then(r => pairIface.decodeFunctionResult("balanceOf", r)[0] as bigint),
    ethers.provider.call({ to: pairAddr, data: pairIface.encodeFunctionData("totalSupply", []) }).then(r => pairIface.decodeFunctionResult("totalSupply", r)[0] as bigint),
  ]);

  console.log("\n✅ SUCCESS");
  console.log("  Pair      :", pairAddr);
  console.log("  LP balance:", ethers.formatEther(lpBal));
  console.log("  LP supply :", ethers.formatEther(ts));
  console.log("  Pool share:", ((Number(lpBal) / Number(ts)) * 100).toFixed(4), "%");

  console.log("\n── Update frontend/src/lib/contracts.ts TESTNET block ──");
  console.log(`  ROUTER  : "${ROUTER}"`);
  console.log(`  MDUSD   : "${MDUSD}"`);
  console.log(`  WDNR    : "${WDNR}"`);
  console.log(`  FACTORY : "${FACTORY}"`);
  console.log(`  PAIR    : "${pairAddr}"`);
}

main().catch((e) => { console.error(e); process.exit(1); });
