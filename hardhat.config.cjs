require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

const privateKey = process.env.PRIVATE_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10
          },
          evmVersion: "london"
        }
      }
    ]
  },
  networks: {
    kortanaTestnet: {
      url: process.env.TESTNET_RPC || "https://poseidon-rpc.testnet.kortana.xyz/",
      chainId: 72511,
      accounts: privateKey ? [privateKey] : [],
      gas: 500000,     // eth_estimateGas on Kortana returns too-low values; override
      gasPrice: 1,     // force legacy (type-0) tx — Kortana does not support EIP-1559
    },
    kortanaMainnet: {
      url: process.env.MAINNET_RPC || "https://zeus-rpc.mainnet.kortana.xyz",
      chainId: 9002,
      accounts: privateKey ? [privateKey] : []
    }
  }
};
