import pkg from 'hardhat';
const { ethers } = pkg;

// Raw ABI to avoid artifact resolution issues
const MDUSD_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function setOperator(address operator, bool status) external",
  "function mint(address to, uint256 amount) external",
  "function isOperator(address) view returns (bool)",
  "function owner() view returns (address)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function cap() view returns (uint256)"
];

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  const MDUSD_ADDRESS = "0x371DeB6F2Bce2c9b3de001F4273b22A0abE03025";
  const provider = ethers.provider;
  const signer = await provider.getSigner(deployer.address);
  const mdUSD = new ethers.Contract(MDUSD_ADDRESS, MDUSD_ABI, signer);

  // Verify contract exists
  const code = await provider.getCode(MDUSD_ADDRESS);
  if (code === "0x") {
    console.error("ERROR: No contract found at", MDUSD_ADDRESS, "- deployment failed!");
    return;
  }
  console.log("Contract confirmed at:", MDUSD_ADDRESS);

  const name = await mdUSD.name();
  const symbol = await mdUSD.symbol();
  const owner = await mdUSD.owner();
  const cap = await mdUSD.cap();
  const totalSupply = await mdUSD.totalSupply();
  const balance = await mdUSD.balanceOf(deployer.address);

  console.log(`Name: ${name}, Symbol: ${symbol}`);
  console.log(`Owner: ${owner}`);
  console.log(`Cap: ${ethers.formatEther(cap)}`);
  console.log(`Total Supply: ${ethers.formatEther(totalSupply)}`);
  console.log(`Deployer Balance: ${ethers.formatEther(balance)} ${symbol}`);

  if (balance === BigInt(0)) {
    console.log("\nBalance is 0. Attempting to mint...");
    
    const isOp = await mdUSD.isOperator(deployer.address);
    console.log("Is deployer an operator?", isOp);
    console.log("Is deployer the owner?", owner.toLowerCase() === deployer.address.toLowerCase());

    if (!isOp) {
      console.log("Setting deployer as operator...");
      const opTx = await mdUSD.setOperator(deployer.address, true);
      await opTx.wait();
      console.log("Operator set!");
    }

    const mintAmount = ethers.parseEther("1000000");
    console.log("Minting 1,000,000 mdUSD...");
    const mintTx = await mdUSD.mint(deployer.address, mintAmount);
    await mintTx.wait();
    
    const newBalance = await mdUSD.balanceOf(deployer.address);
    console.log("SUCCESS! New balance:", ethers.formatEther(newBalance), symbol);
  }
}

main().catch(console.error);
