/**
 * deploy_mono.ts
 * Deploys KortanaMonoDEX, mints mdUSD to deployer, seeds the pool.
 *
 * npx hardhat run scripts/deploy_mono.ts --network kortanaTestnet
 */
import pkg from "hardhat";
const { ethers, artifacts } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("DNR bal :", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  const artifact = await artifacts.readArtifact("KortanaMonoDEX");
  const iface    = new ethers.Interface(artifact.abi);

  // ── Deploy ───────────────────────────────────────────────────────────────
  console.log("\n=== Deploy KortanaMonoDEX ===");
  const deployData = artifact.bytecode +
    iface.encodeDeploy([deployer.address]).slice(2); // append constructor arg
  const deployTx = await deployer.sendTransaction({
    data: deployData,
    gasLimit: 3000000n,
    gasPrice: 1n,
  });
  const deployReceipt = await deployTx.wait();
  if (deployReceipt.status !== 1 || !deployReceipt.contractAddress)
    throw new Error("Deploy failed");
  const DEX = deployReceipt.contractAddress;
  console.log("KortanaMonoDEX:", DEX, "  gasUsed:", deployReceipt.gasUsed.toString());

  // ── Helpers ───────────────────────────────────────────────────────────────
  async function send(fn: string, args: any[], value = 0n, gas = 500000n) {
    const data = iface.encodeFunctionData(fn, args);
    console.log(`  → ${fn}(${args.map(a => a.toString()).join(", ")})`);
    const tx = await deployer.sendTransaction({ to: DEX, data, value, gasLimit: gas, gasPrice: 1n });
    const r  = await tx.wait();
    if (r.status !== 1) throw new Error(`${fn} reverted  gasUsed:${r.gasUsed}`);
    console.log(`  ✓ gasUsed: ${r.gasUsed}`);
    return r;
  }

  async function readView(fn: string, args: any[]) {
    const data   = iface.encodeFunctionData(fn, args);
    const result = await ethers.provider.call({ to: DEX, data });
    return iface.decodeFunctionResult(fn, result);
  }

  // ── Mint 1M mdUSD to deployer ─────────────────────────────────────────────
  console.log("\n=== Mint mdUSD ===");
  await send("mint", [deployer.address, ethers.parseEther("1000000")]);
  const [bal] = await readView("balanceOf", [deployer.address]);
  console.log("  mdUSD balance:", ethers.formatEther(bal));

  // ── Seed pool: 10 DNR + 100 mdUSD ────────────────────────────────────────
  console.log("\n=== Seed pool: 10 DNR + 100 mdUSD ===");
  await send(
    "addLiquidity",
    [
      ethers.parseEther("100"),  // amountMDUSD
      ethers.parseEther("99"),   // amountMDUSDMin
      ethers.parseEther("9.9"),  // amountDNRMin
      deployer.address,
    ],
    ethers.parseEther("10"),     // msg.value (DNR)
    1000000n
  );

  // ── Verify ────────────────────────────────────────────────────────────────
  const [rMDUSD, rDNR]  = await readView("getReserves", []);
  const [lpBal]         = await readView("lpBalanceOf", [deployer.address]);
  const [lpSupply]      = await readView("lpTotalSupply", []);

  console.log("\n✅ Pool seeded successfully");
  console.log("  reserveMDUSD:", ethers.formatEther(rMDUSD));
  console.log("  reserveDNR  :", ethers.formatEther(rDNR));
  console.log("  LP balance  :", ethers.formatEther(lpBal));
  console.log("  LP supply   :", ethers.formatEther(lpSupply));

  console.log("\n─── Update frontend/src/lib/contracts.ts ───");
  console.log(`  MONO_DEX: "${DEX}"`);
  console.log("  (MDUSD, WDNR, FACTORY, ROUTER all replaced by this single address)");
}

main().catch(e => { console.error(e); process.exit(1); });
