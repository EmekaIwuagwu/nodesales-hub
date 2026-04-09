/**
 * diag_gas.ts - Binary search for which Kortana EVM operation costs excessive gas
 */
import pkg from "hardhat";
const { ethers, artifacts } = pkg;

async function main() {
  const [dep] = await ethers.getSigners();
  console.log("Deployer:", dep.address);

  const art = await artifacts.readArtifact("GasDiag");
  const iface = new ethers.Interface(art.abi);

  // Deploy
  const tx = await dep.sendTransaction({ data: art.bytecode, gasLimit: 2000000n, gasPrice: 1n });
  const r = await tx.wait();
  if (!r.contractAddress) throw new Error("Deploy failed");
  const D = r.contractAddress;
  console.log("GasDiag at:", D, "gasUsed:", r.gasUsed.toString());

  async function run(fn: string, args: any[], value = 0n, gas = 500000n): Promise<{ok: boolean, used: bigint}> {
    try {
      const data = iface.encodeFunctionData(fn, args);
      const t = await dep.sendTransaction({ to: D, data, value, gasLimit: gas, gasPrice: 1n });
      const rec = await t.wait();
      return { ok: rec.status === 1, used: rec.gasUsed };
    } catch (e: any) {
      return { ok: false, used: e?.receipt?.gasUsed ?? 0n };
    }
  }

  const tests: Array<[string, any[], bigint]> = [
    ["test2Sstores",          [42n],                          0n],
    ["test5Sstores",          [42n],                          0n],
    ["test8Sstores",          [42n],                          0n],
    ["test3MappingSstores",   [42n],                          0n],
    ["test8SstoresWith4Sloads",[42n],                         0n],
    ["testHeavyMath",         [ethers.parseEther("100"), ethers.parseEther("10")], 0n],
    ["testPayable5Sstores",   [42n],   ethers.parseEther("1")],
    ["testEmit",              [42n],                          0n],
  ];

  for (const [fn, args, val] of tests) {
    const { ok, used } = await run(fn, args, val);
    console.log(`  ${ok ? "✅" : "❌"} ${fn.padEnd(30)} gasUsed: ${used}`);
  }

  // Test 9: full add liquidity simulation (need to set balance first)
  console.log("\n--- Full addLiquidity simulation ---");
  // First set balance
  const s = await run("setBalance", [dep.address, ethers.parseEther("1000000")]);
  console.log(`  setBalance: ${s.ok ? "✅" : "❌"} gasUsed: ${s.used}`);

  const liq = await run("testFullAddLiq", [ethers.parseEther("100"), dep.address], ethers.parseEther("10"), 1000000n);
  console.log(`  testFullAddLiq: ${liq.ok ? "✅" : "❌"} gasUsed: ${liq.used}`);
}

main().catch(e => { console.error(e); process.exit(1); });
