/**
 * test_add_liquidity.ts
 * Simulates the full addLiquidityDNR flow directly from hardhat.
 * If this works, the contracts are fine and the bug is frontend-only.
 * If this fails, we have a contract bug.
 *
 * Run: npx hardhat run scripts/test_add_liquidity.ts --network kortanaTestnet
 */
import pkg from "hardhat";
const { ethers } = pkg;

const MDUSD   = "0xEA492aA6e52E9202d2f377C2FD16395cb4A2D7B8";
const WDNR    = "0x6caF81cF2Dd6AD0B24fc05379a3B972630F9ee5e";
const FACTORY = "0xC4dB19E4bd1a679C4255966e76257d774aBC2Fe7";
const ROUTER  = "0xcA3e51328765C7C02C0DEC5B72B1c458254716Bc";

const MDUSD_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) external returns (bool)",
];
const FACTORY_ABI = [
  "function getPair(address,address) view returns (address)",
];
const ROUTER_ABI = [
  "function addLiquidityDNR(address token, uint amountTokenDesired, uint amountTokenMin, uint amountDNRMin, address to, uint deadline) payable returns (uint,uint,uint)",
];
const PAIR_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
];

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("DNR balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  const mdUSD   = new ethers.Contract(MDUSD, MDUSD_ABI, deployer);
  const factory = new ethers.Contract(FACTORY, FACTORY_ABI, deployer);
  const router  = new ethers.Contract(ROUTER, ROUTER_ABI, deployer);

  const mdUSDBalance = await mdUSD.balanceOf(deployer.address);
  console.log("mdUSD balance:", ethers.formatEther(mdUSDBalance));

  // Amounts to deposit
  const amountToken = ethers.parseEther("100");   // 100 mdUSD
  const amountDNR   = ethers.parseEther("10");    // 10 DNR

  if (mdUSDBalance < amountToken) {
    console.error("Not enough mdUSD. Run fund_faucet.ts first.");
    process.exit(1);
  }

  // Check pair
  const existingPair = await factory.getPair(MDUSD, WDNR);
  console.log("\nExisting pair:", existingPair);
  const isNewPool = existingPair === "0x0000000000000000000000000000000000000000";
  console.log("Is new pool:", isNewPool);

  const factoryFull = new ethers.Contract(FACTORY, [
    "function getPair(address,address) view returns (address)",
    "function createPair(address,address) external returns (address)",
  ], deployer);

  // Step 1 (new): Pre-create the pair if needed — separates expensive CREATE2 from liquidity add
  if (isNewPool) {
    console.log("\n--- Step 0: createPair (pre-create before addLiquidity) ---");
    const createTx = await factoryFull.createPair(MDUSD, WDNR, { gasLimit: 15000000 });
    const createReceipt = await createTx.wait();
    console.log("createPair tx:", createReceipt.hash, "status:", createReceipt.status, "gasUsed:", createReceipt.gasUsed.toString());
    if (createReceipt.status !== 1) {
      console.error("createPair FAILED");
      process.exit(1);
    }
    const newPair = await factory.getPair(MDUSD, WDNR);
    console.log("Pair created at:", newPair);
  }

  // Step 1: Approve
  console.log("\n--- Step 1: Approve mdUSD to router ---");
  const currentAllowance = await mdUSD.allowance(deployer.address, ROUTER);
  console.log("Current allowance:", ethers.formatEther(currentAllowance));

  if (currentAllowance < amountToken) {
    console.log("Approving...");
    const approveTx = await mdUSD.approve(ROUTER, amountToken, { gasLimit: 200000 });
    const approveReceipt = await approveTx.wait();
    console.log("Approve tx:", approveReceipt.hash, "status:", approveReceipt.status);
    if (approveReceipt.status !== 1) {
      console.error("APPROVE FAILED");
      process.exit(1);
    }
  } else {
    console.log("Already approved.");
  }

  // Step 2: addLiquidityDNR (pair already exists — no CREATE2 deployment needed)
  console.log("\n--- Step 2: addLiquidityDNR ---");
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);
  const amountTokenMin = (amountToken * 995n) / 1000n;
  const amountDNRMin   = (amountDNR * 995n) / 1000n;

  console.log("amountTokenDesired:", ethers.formatEther(amountToken), "mdUSD");
  console.log("amountDNR (msg.value):", ethers.formatEther(amountDNR), "DNR");
  console.log("amountTokenMin:", ethers.formatEther(amountTokenMin));
  console.log("amountDNRMin:", ethers.formatEther(amountDNRMin));

  try {
    const tx = await router.addLiquidityDNR(
      MDUSD,
      amountToken,
      amountTokenMin,
      amountDNRMin,
      deployer.address,
      deadline,
      { value: amountDNR, gasLimit: 1000000 }
    );
    console.log("addLiquidityDNR tx sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("Status:", receipt.status, "gasUsed:", receipt.gasUsed.toString());

    if (receipt.status !== 1) {
      console.error("❌ addLiquidityDNR REVERTED on-chain!");
      process.exit(1);
    }

    console.log("\n✅ addLiquidityDNR SUCCEEDED");

    // Check results
    const pairAddr = await factory.getPair(MDUSD, WDNR);
    console.log("Pair address:", pairAddr);

    const pair = new ethers.Contract(pairAddr, PAIR_ABI, deployer);
    const lpBalance = await pair.balanceOf(deployer.address);
    const totalSupply = await pair.totalSupply();
    console.log("LP balance:", ethers.formatEther(lpBalance));
    console.log("Total supply:", ethers.formatEther(totalSupply));
    console.log("Pool share:", ((parseFloat(ethers.formatEther(lpBalance)) / parseFloat(ethers.formatEther(totalSupply))) * 100).toFixed(4), "%");

  } catch (err: any) {
    console.error("\n❌ addLiquidityDNR FAILED:", err.message ?? err);
    process.exit(1);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
