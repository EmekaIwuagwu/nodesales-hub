import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // 1. Deploy mdUSD
  console.log("Deploying mdUSD...");
  const mdUSD = await ethers.deployContract("mdUSD", [
    "mdUSD",
    "mdUSD",
    ethers.parseEther("0"),
    ethers.parseEther("1000000000"),
    deployer.address,
  ]);
  await mdUSD.waitForDeployment();
  console.log("mdUSD deployed to:", mdUSD.target);

  // 2. Deploy WDNR
  console.log("Deploying WDNR...");
  const WDNR = await ethers.deployContract("WDNR");
  await WDNR.waitForDeployment();
  console.log("WDNR deployed to:", WDNR.target);

  // 3. Deploy KortanaFactory
  console.log("Deploying KortanaFactory...");
  const KortanaFactory = await ethers.deployContract("KortanaFactory", [deployer.address]);
  await KortanaFactory.waitForDeployment();
  console.log("KortanaFactory deployed to:", KortanaFactory.target);

  // 4. Deploy KortanaRouter
  console.log("Deploying KortanaRouter...");
  const KortanaRouter = await ethers.deployContract("KortanaRouter", [
    KortanaFactory.target,
    WDNR.target,
  ]);
  await KortanaRouter.waitForDeployment();
  console.log("KortanaRouter deployed to:", KortanaRouter.target);

  // 5. Mint initial mdUSD to deployer
  console.log("Minting initial mdUSD...");
  const mintAmount = ethers.parseEther("1000000"); // 1M mdUSD
  // Add deployer as operator for mdUSD
  await mdUSD.setOperator(deployer.address, true);
  await mdUSD.mint(deployer.address, mintAmount);

  // 6. Create DNR/mdUSD pair
  console.log("Creating DNR/mdUSD pair...");
  await KortanaFactory.createPair(WDNR.target, mdUSD.target);

  // 7. Seed initial liquidity (1:1 price)
  console.log("Seeding initial liquidity...");
  const router = await ethers.getContractAt("KortanaRouter", KortanaRouter.target);
  const amountDNR = ethers.parseEther("10000");   // 10K DNR
  const amountmdUSD = ethers.parseEther("10000"); // 10K mdUSD

  // Approve router for mdUSD
  await mdUSD.approve(router.target, amountmdUSD);

  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 mins

  // Add liquidity
  await router.addLiquidityDNR(
    mdUSD.target,
    amountmdUSD,
    0, // min token
    0, // min DNR
    deployer.address,
    deadline,
    { value: amountDNR }
  );

  console.log("Initial liquidity added!");

  // 8. Execute first swap (to activate DEXScreener indexing)
  console.log("Executing first swap...");
  const swapAmountDNRIn = ethers.parseEther("1"); // Swap 1 DNR
  
  await router.swapExactDNRForTokens(
    0, // amountOutMin
    [WDNR.target, mdUSD.target],
    deployer.address,
    deadline,
    { value: swapAmountDNRIn }
  );

  console.log("First swap executed successfully!");
  console.log("------------------- DEPLOYMENT COMPLETE -------------------");
  console.log(`mdUSD: ${mdUSD.target}`);
  console.log(`WDNR: ${WDNR.target}`);
  console.log(`Factory: ${KortanaFactory.target}`);
  console.log(`Router: ${KortanaRouter.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
