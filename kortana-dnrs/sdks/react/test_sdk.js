import { ethers } from 'ethers';
import { DNRS_ABI, BOARDROOM_ABI, NETWORKS } from './abi.js';

// ─────────────────────────────────────────────
// DNRS React / Node SDK Full Test Script
// Run with: node test_sdk.js
// ─────────────────────────────────────────────

const RPC_URL = NETWORKS.KORTANA_TESTNET.rpcUrl;
const DNRS_ADDRESS = NETWORKS.KORTANA_TESTNET.dnrs;
const BOARDROOM_ADDRESS = NETWORKS.KORTANA_TESTNET.boardroom;

async function checkBalance(provider, address) {
  const contract = new ethers.Contract(DNRS_ADDRESS, DNRS_ABI, provider);
  const balance = await contract.balanceOf(address);
  return ethers.formatUnits(balance, 18);
}

async function transferDNRS(signer, toAddress, amountEther) {
  const contract = new ethers.Contract(DNRS_ADDRESS, DNRS_ABI, signer);
  const tx = await contract.transfer(toAddress, ethers.parseUnits(amountEther.toString(), 18));
  const receipt = await tx.wait();
  return receipt.hash;
}

async function main() {
  console.log("═══════════════════════════════════");
  console.log("  Kortana DNRS — React/Node SDK Test");
  console.log("  Network: Kortana Testnet (72511)");
  console.log("═══════════════════════════════════\n");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const network = await provider.getNetwork();
  console.log(`Connected to Chain ID: ${network.chainId}`);

  const accountAddress = "0xf251038d1dB96Ce1a733Ae92247E0A6F400F275E";

  // 1. Check Balance
  console.log("\n[1] Checking DNRS Balance...");
  const balance = await checkBalance(provider, accountAddress);
  console.log(`    Address : ${accountAddress}`);
  console.log(`    Balance : ${balance} DNRS`);

  // 2. Simulate Mainnet Config Lookup
  console.log("\n[2] Mainnet Network Config...");
  console.log(`    Mainnet RPC : ${NETWORKS.KORTANA_MAINNET.rpcUrl}`);
  console.log(`    Mainnet DNRS: ${NETWORKS.KORTANA_MAINNET.dnrs}`);
  console.log(`    (Mainnet contracts deploy upon mainnet launch)`);

  // 3. Transfer (requires private key signer — skipped on read-only node connection)
  console.log("\n[3] Transfer Demo (requires signer)...");
  console.log("    To execute: const wallet = new ethers.Wallet(PRIVATE_KEY, provider);");
  console.log("    Then call: await transferDNRS(wallet, '0xRecipient', 10.0)");
  console.log("    This will sign with EIP-155 and broadcast to the Kortana network.");

  console.log("\n✅ SDK Test Complete.\n");
}

main().catch(console.error);
