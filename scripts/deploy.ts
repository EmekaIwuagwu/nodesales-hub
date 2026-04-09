import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  const nonce = await ethers.provider.getTransactionCount(deployer.address, "latest");
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Current nonce:", nonce);
  console.log("Balance:", ethers.formatEther(balance), "DNR");

  // Deploy mdUSD
  console.log("\n1. Deploying mdUSD...");
  const mdUSDFactory = await ethers.getContractFactory("mdUSD");
  const mdUSD = await mdUSDFactory.deploy(
    "mdUSD",
    "mdUSD",
    ethers.parseEther("0"),       // no initial supply
    ethers.parseEther("1000000000"), // 1B cap
    deployer.address
  );
  await mdUSD.waitForDeployment();
  const mdUSDAddr = await mdUSD.getAddress();
  console.log("mdUSD:", mdUSDAddr);

  // Deploy WDNR
  console.log("\n2. Deploying WDNR...");
  const WDNRFactory = await ethers.getContractFactory("WDNR");
  const WDNR = await WDNRFactory.deploy();
  await WDNR.waitForDeployment();
  const wdnrAddr = await WDNR.getAddress();
  console.log("WDNR:", wdnrAddr);

  // Deploy Factory
  console.log("\n3. Deploying KortanaFactory...");
  const FactoryFactory = await ethers.getContractFactory("KortanaFactory");
  const factory = await FactoryFactory.deploy(deployer.address);
  await factory.waitForDeployment();
  const factoryAddr = await factory.getAddress();
  console.log("Factory:", factoryAddr);

  // Deploy Router
  console.log("\n4. Deploying KortanaRouter...");
  const RouterFactory = await ethers.getContractFactory("KortanaRouter");
  const router = await RouterFactory.deploy(factoryAddr, wdnrAddr);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log("Router:", routerAddr);

  // Mint mdUSD to deployer
  console.log("\n5. Minting 1,000,000 mdUSD to deployer...");
  const setOpTx = await mdUSD.setOperator(deployer.address, true);
  await setOpTx.wait();
  const mintTx = await mdUSD.mint(deployer.address, ethers.parseEther("1000000"));
  await mintTx.wait();
  
  const balance2 = await mdUSD.balanceOf(deployer.address);
  console.log("mdUSD balance:", ethers.formatEther(balance2));

  console.log("\n========== DEPLOYMENT COMPLETE ==========");
  console.log("KORTANA_ROUTER_ADDRESS =", routerAddr);
  console.log("MDUSD_ADDRESS          =", mdUSDAddr);
  console.log("WDNR_ADDRESS           =", wdnrAddr);
  console.log("FACTORY_ADDRESS        =", factoryAddr);
  console.log("=========================================");
  console.log("\nUpdate frontend/src/lib/contracts.ts with these addresses!");
}

main().catch(console.error);
