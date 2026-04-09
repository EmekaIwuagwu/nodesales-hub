import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const tokenAddress = "0x371DeB6F2Bce2c9b3de001F4273b22A0abE03025";
  const userAddress = "0xf251038d1dB96Ce1a733Ae92247E0A6F400F275E";
  
  const mdUSD = await ethers.getContractAt("mdUSD", tokenAddress);
  const balance = await mdUSD.balanceOf(userAddress);
  const name = await mdUSD.name();
  const symbol = await mdUSD.symbol();
  
  console.log(`Token Name: ${name}`);
  console.log(`Token Symbol: ${symbol}`);
  console.log(`Deployer Balance: ${ethers.formatEther(balance)} mdUSD`);
}

main().catch(console.error);
