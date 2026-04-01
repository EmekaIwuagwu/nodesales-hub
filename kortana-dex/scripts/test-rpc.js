const { ethers } = require("hardhat");

async function main() {
  try {
    const provider = new ethers.JsonRpcProvider("https://poseidon-rpc.testnet.kortana.xyz/");
    const network = await provider.getNetwork();
    console.log("Connected to network:", network.name, network.chainId.toString());
    const balance = await provider.getBalance("0xf251038d1dB96Ce1a733Ae92247E0A6F400F275E");
    console.log("Balance of test account:", ethers.formatEther(balance));
  } catch (e) {
    console.error("Connection failed:", e);
  }
}

main();
