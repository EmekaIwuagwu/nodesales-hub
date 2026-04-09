import fs from "fs";
import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.TESTNET_RPC || "https://poseidon-rpc.testnet.kortana.xyz/");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("Deploying contracts to Testnet with account:", wallet.address);

  const getArtifact = (name, path) => {
    return JSON.parse(fs.readFileSync(`./artifacts/contracts/${path}/${name}.sol/${name}.json`, 'utf8'));
  };

  const gasOverride = {
    gasLimit: 6000000,
    gasPrice: ethers.parseUnits("10", "gwei")
  };

  const routerGasOverride = {
    gasLimit: 15000000,
    gasPrice: ethers.parseUnits("10", "gwei")
  };

  // 1. mdUSD
  console.log("Deploying mdUSD...");
  const mdUSDArtifact = getArtifact("mdUSD", "tokens");
  const mdUSDFactory = new ethers.ContractFactory(mdUSDArtifact.abi, mdUSDArtifact.bytecode, wallet);
  const mdUSD = await mdUSDFactory.deploy("mdUSD", "mdUSD", 0, ethers.parseUnits("1000000000", 18), wallet.address, gasOverride);
  await mdUSD.waitForDeployment();
  const mdUSDAddress = await mdUSD.getAddress();
  console.log("mdUSD deployed to:", mdUSDAddress);

  // 2. WDNR
  console.log("Deploying WDNR...");
  const WDNRArtifact = getArtifact("WDNR", "tokens");
  const WDNRFactory = new ethers.ContractFactory(WDNRArtifact.abi, WDNRArtifact.bytecode, wallet);
  const WDNR = await WDNRFactory.deploy(gasOverride);
  await WDNR.waitForDeployment();
  const WDNRAddress = await WDNR.getAddress();
  console.log("WDNR deployed to:", WDNRAddress);

  // 3. KortanaFactory
  console.log("Deploying KortanaFactory...");
  const FactoryArtifact = getArtifact("KortanaFactory", "core");
  const FactoryFactory = new ethers.ContractFactory(FactoryArtifact.abi, FactoryArtifact.bytecode, wallet);
  const Factory = await FactoryFactory.deploy(wallet.address, gasOverride);
  await Factory.waitForDeployment();
  const FactoryAddress = await Factory.getAddress();
  console.log("Factory deployed to:", FactoryAddress);

  // 4. KortanaRouter
  console.log("Deploying KortanaRouter...");
  const RouterArtifact = getArtifact("KortanaRouter", "periphery");
  const RouterFactory = new ethers.ContractFactory(RouterArtifact.abi, RouterArtifact.bytecode, wallet);
  const Router = await RouterFactory.deploy(FactoryAddress, WDNRAddress, routerGasOverride);
  await Router.waitForDeployment();
  const RouterAddress = await Router.getAddress();
  console.log("Router deployed to:", RouterAddress);

  // 5. Initial setup
  console.log("Performing initial setup...");
  const mdUSDContract = new ethers.Contract(mdUSDAddress, mdUSDArtifact.abi, wallet);
  await (await mdUSDContract.setOperator(wallet.address, true, gasOverride)).wait();
  await (await mdUSDContract.mint(wallet.address, ethers.parseUnits("1000000", 18), gasOverride)).wait();
  
  console.log("\n-------------------------------------------");
  console.log("Deployment Complete!");
  console.log("MDUSD_ADDRESS =", mdUSDAddress);
  console.log("WDNR_ADDRESS =", WDNRAddress);
  console.log("FACTORY_ADDRESS =", FactoryAddress);
  console.log("ROUTER_ADDRESS =", RouterAddress);
  console.log("-------------------------------------------\n");
}

main().catch(console.error);
