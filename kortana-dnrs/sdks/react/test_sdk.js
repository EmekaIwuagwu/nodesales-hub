import { useDNRS } from './useDNRS';
import { ethers } from 'ethers';

// This is a browser-ready script example
async function runTest() {
  const addressToCheck = "0xf251038d1dB96Ce1a733Ae92247E0A6F400F275E";
  
  // Connect to Kortana Testnet
  const provider = new ethers.JsonRpcProvider("https://poseidon-rpc.testnet.kortana.xyz/");
  
  // Check Balance Example
  const DNRS_ADDRESS = "0xa1E9679c7AE524a09AbE34464A99d8D5daaEA92B";
  const DNRS_ABI = ["function balanceOf(address owner) view returns (uint256)"];
  
  const contract = new ethers.Contract(DNRS_ADDRESS, DNRS_ABI, provider);
  const balance = await contract.balanceOf(addressToCheck);
  
  console.log("--- DNRS React SDK Test ---");
  console.log("Account:", addressToCheck);
  console.log("Balance:", ethers.formatEther(balance), "DNRS");
}

runTest().catch(console.error);
