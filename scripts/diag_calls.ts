/**
 * diag_calls.ts
 * Tests whether Kortana EVM supports contract-to-contract CALL.
 * Deploys TestProxy, calls getBalance(token, addr) which internally calls token.balanceOf(addr).
 * If that fails with all gas used → contract-to-contract CALLs are broken on Kortana.
 */
import pkg from "hardhat";
const { ethers, artifacts } = pkg;

const MDUSD = "0x24751084393DD93E1fa86d7A0a5Dbb3dba9f80aE";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // ── 1. Deploy TestProxy via raw EOA tx ───────────────────────────────────
  console.log("\n=== Deploy TestProxy ===");
  const artifact = await artifacts.readArtifact("TestProxy");
  const tx = await deployer.sendTransaction({
    data: artifact.bytecode,
    gasLimit: 1000000n,
    gasPrice: 1n,
  });
  const receipt = await tx.wait();
  if (receipt.status !== 1 || !receipt.contractAddress) throw new Error("TestProxy deploy failed");
  const proxy = receipt.contractAddress;
  console.log("TestProxy deployed at:", proxy, "gasUsed:", receipt.gasUsed.toString());

  // ── 2. Test: proxy.getBalance(MDUSD, deployer) ──────────────────────────
  console.log("\n=== Test contract-to-contract CALL ===");
  console.log("Calling proxy.getBalance(mdUSD, deployer)...");
  const iface = new ethers.Interface([
    "function getBalance(address token, address account) external returns (uint256)",
    "function lastResult() view returns (uint256)",
  ]);

  for (const gasLimit of [200000n, 500000n, 1000000n]) {
    try {
      const callTx = await deployer.sendTransaction({
        to: proxy,
        data: iface.encodeFunctionData("getBalance", [MDUSD, deployer.address]),
        gasLimit,
        gasPrice: 1n,
      });
      const r = await callTx.wait();
      if (r.status === 1) {
        console.log(`✅ SUCCESS with gasLimit=${gasLimit}, gasUsed=${r.gasUsed}`);

        // Read lastResult
        const res = await ethers.provider.call({
          to: proxy,
          data: iface.encodeFunctionData("lastResult", []),
        });
        const [val] = iface.decodeFunctionResult("lastResult", res);
        console.log("lastResult (mdUSD balance of deployer):", ethers.formatEther(val));
        console.log("\n✅ CONCLUSION: Kortana EVM SUPPORTS contract-to-contract calls.");
        return;
      } else {
        console.log(`❌ reverted gasLimit=${gasLimit} gasUsed=${r.gasUsed}`);
      }
    } catch (e: any) {
      const used = e?.receipt?.gasUsed?.toString() ?? "?";
      console.log(`❌ threw gasLimit=${gasLimit} gasUsed=${used}`);
    }
  }

  console.log("\n❌ CONCLUSION: Kortana EVM does NOT support contract-to-contract calls.");
  console.log("   All cross-contract CALLs from within a contract execution fail.");
  console.log("   This is the root cause of pair.mint() consuming all gas.");
}

main().catch(e => { console.error(e); process.exit(1); });
