/**
 * setup_new_contracts.ts
 * 1. SetOperator + mint 1M mdUSD to deployer (raw sendTransaction)
 * 2. createPair (new CREATE-based factory)
 * 3. Full addLiquidityDNR test
 */
import pkg from "hardhat";
const { ethers } = pkg;

const MDUSD   = "0xEA492aA6e52E9202d2f377C2FD16395cb4A2D7B8";
const WDNR    = "0x6caF81cF2Dd6AD0B24fc05379a3B972630F9ee5e";
const FACTORY = "0xC4dB19E4bd1a679C4255966e76257d774aBC2Fe7";
const ROUTER  = "0xcA3e51328765C7C02C0DEC5B72B1c458254716Bc";

const iface = new ethers.Interface([
  "function owner() view returns (address)",
  "function isOperator(address) view returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function setOperator(address,bool) external",
  "function mint(address,uint256) external",
  "function approve(address,uint256) external returns (bool)",
  "function getPair(address,address) view returns (address)",
  "function createPair(address,address) external returns (address)",
  "function addLiquidityDNR(address,uint256,uint256,uint256,address,uint256) payable returns (uint256,uint256,uint256)",
]);

async function send(deployer: any, to: string, fn: string, args: any[], value = 0n, gas = 500000n) {
  const data = iface.encodeFunctionData(fn, args);
  console.log(`  → ${fn}(${args.map(a => a.toString()).join(", ")})`);
  const tx = await deployer.sendTransaction({ to, data, value, gasLimit: gas });
  const receipt = await tx.wait();
  if (receipt.status !== 1) throw new Error(`${fn} reverted! gasUsed: ${receipt.gasUsed}`);
  console.log(`  ✓ ${fn} confirmed. gasUsed: ${receipt.gasUsed}`);
  return receipt;
}

async function call(provider: any, to: string, fn: string, args: any[]) {
  const data = iface.encodeFunctionData(fn, args);
  const result = await provider.call({ to, data });
  return iface.decodeFunctionResult(fn, result)[0];
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // ── 1. Fund mdUSD ─────────────────────────────────────────────────────────
  console.log("\n=== Step 1: Fund mdUSD ===");
  const isOp = await call(ethers.provider, MDUSD, "isOperator", [deployer.address]);
  if (!isOp) {
    await send(deployer, MDUSD, "setOperator", [deployer.address, true]);
  } else {
    console.log("  Already operator.");
  }
  await send(deployer, MDUSD, "mint", [deployer.address, ethers.parseEther("1000000")]);
  const balance = await call(ethers.provider, MDUSD, "balanceOf", [deployer.address]);
  console.log("  mdUSD balance:", ethers.formatEther(balance));

  // ── 2. createPair ─────────────────────────────────────────────────────────
  console.log("\n=== Step 2: createPair ===");
  const existingPair = await call(ethers.provider, FACTORY, "getPair", [MDUSD, WDNR]);
  if (existingPair !== "0x0000000000000000000000000000000000000000") {
    console.log("  Pair already exists:", existingPair);
  } else {
    await send(deployer, FACTORY, "createPair", [MDUSD, WDNR], 0n, 5000000n);
    const pairAddr = await call(ethers.provider, FACTORY, "getPair", [MDUSD, WDNR]);
    console.log("  Pair created at:", pairAddr);
  }

  // ── 3. Approve ────────────────────────────────────────────────────────────
  console.log("\n=== Step 3: Approve mdUSD to Router ===");
  const amount = ethers.parseEther("100");
  const allowed = await call(ethers.provider, MDUSD, "allowance", [deployer.address, ROUTER]);
  if (allowed < amount) {
    await send(deployer, MDUSD, "approve", [ROUTER, amount]);
  } else {
    console.log("  Already approved:", ethers.formatEther(allowed));
  }

  // ── 4. addLiquidityDNR ────────────────────────────────────────────────────
  console.log("\n=== Step 4: addLiquidityDNR ===");
  const amountDNR   = ethers.parseEther("10");
  const amountToken = ethers.parseEther("100");
  const tokenMin    = (amountToken * 995n) / 1000n;
  const dnrMin      = (amountDNR * 995n) / 1000n;
  const deadline    = BigInt(Math.floor(Date.now() / 1000) + 1200);

  await send(deployer, ROUTER, "addLiquidityDNR",
    [MDUSD, amountToken, tokenMin, dnrMin, deployer.address, deadline],
    amountDNR,
    1000000n
  );

  // ── 5. Results ────────────────────────────────────────────────────────────
  const pairAddr = await call(ethers.provider, FACTORY, "getPair", [MDUSD, WDNR]);
  const pairIface = new ethers.Interface([
    "function balanceOf(address) view returns (uint256)",
    "function totalSupply() view returns (uint256)",
  ]);
  const lpBal = iface.decodeFunctionResult("balanceOf",
    await ethers.provider.call({ to: pairAddr, data: pairIface.encodeFunctionData("balanceOf", [deployer.address]) })
  )[0];
  const ts = iface.decodeFunctionResult("totalSupply",
    await ethers.provider.call({ to: pairAddr, data: pairIface.encodeFunctionData("totalSupply", []) })
  )[0];
  console.log("\n✅ SUCCESS");
  console.log("  Pair:", pairAddr);
  console.log("  LP balance:", ethers.formatEther(lpBal));
  console.log("  Total supply:", ethers.formatEther(ts));
  console.log("  Pool share:", ((parseFloat(ethers.formatEther(lpBal)) / parseFloat(ethers.formatEther(ts))) * 100).toFixed(4), "%");
}

main().catch(e => { console.error(e); process.exit(1); });
