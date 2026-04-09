import fs from "fs";
import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");
  // Hardhat dev account 1
  const deployer = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider);

  console.log("Deploying contracts with account:", deployer.address);

  const getArtifact = (name, path) => {
    return JSON.parse(fs.readFileSync(`./artifacts/contracts/${path}/${name}.sol/${name}.json`, 'utf8'));
  };

  // 1. mdUSD
  console.log("Deploying mdUSD...");
  const mdUSDArtifact = getArtifact("mdUSD", "tokens");
  const mdUSDFactory = new ethers.ContractFactory(mdUSDArtifact.abi, mdUSDArtifact.bytecode, deployer);
  const mdUSD = await mdUSDFactory.deploy("mdUSD", "mdUSD", ethers.parseEther("0"), ethers.parseEther("1000000000"), deployer.address);
  await mdUSD.waitForDeployment();
  const mdUSDAddress = await mdUSD.getAddress();
  console.log("mdUSD deployed to:", mdUSDAddress);

  // 2. WDNR
  console.log("Deploying WDNR...");
  const WDNRArtifact = getArtifact("WDNR", "tokens");
  const WDNRFactory = new ethers.ContractFactory(WDNRArtifact.abi, WDNRArtifact.bytecode, deployer);
  const WDNR = await WDNRFactory.deploy();
  await WDNR.waitForDeployment();
  const WDNRAddress = await WDNR.getAddress();
  console.log("WDNR deployed to:", WDNRAddress);

  // 3. KortanaFactory
  console.log("Deploying KortanaFactory...");
  const FactoryArtifact = getArtifact("KortanaFactory", "core");
  const FactoryFactory = new ethers.ContractFactory(FactoryArtifact.abi, FactoryArtifact.bytecode, deployer);
  const Factory = await FactoryFactory.deploy(deployer.address);
  await Factory.waitForDeployment();
  const FactoryAddress = await Factory.getAddress();
  console.log("Factory deployed to:", FactoryAddress);

  // 4. KortanaRouter
  console.log("Deploying KortanaRouter...");
  const RouterArtifact = getArtifact("KortanaRouter", "periphery");
  const RouterFactory = new ethers.ContractFactory(RouterArtifact.abi, RouterArtifact.bytecode, deployer);
  const Router = await RouterFactory.deploy(FactoryAddress, WDNRAddress);
  await Router.waitForDeployment();
  const RouterAddress = await Router.getAddress();
  console.log("Router deployed to:", RouterAddress);
  
  console.log("\n-------------------------------------------");
  console.log("Success! Copy these addresses into frontend context:");
  console.log("MDUSD_ADDRESS =", mdUSDAddress);
  console.log("WDNR_ADDRESS =", WDNRAddress);
  console.log("FACTORY_ADDRESS =", FactoryAddress);
  console.log("ROUTER_ADDRESS =", RouterAddress);
  console.log("-------------------------------------------\n");
}

main().catch(console.error);
