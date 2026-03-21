// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 800,  // Optimized for frequently called functions
          },
          viaIR: true,
        },
      },
    ],
  },
  networks: {
    kortanaTestnet: {
      url: "https://poseidon-rpc.testnet.kortana.xyz/",
      chainId: 72511,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
    kortanaMainnet: {
      url: "https://zeus-rpc.mainnet.kortana.xyz",
      chainId: 9002,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
  },
  etherscan: {
    apiKey: {
      kortanaTestnet: process.env.TESTNET_EXPLORER_API_KEY || "placeholder",
      kortanaMainnet: process.env.MAINNET_EXPLORER_API_KEY || "placeholder",
    },
    customChains: [
      {
        network: "kortanaTestnet",
        chainId: 72511,
        urls: {
          apiURL: "https://explorer.testnet.kortana.xyz/api",
          browserURL: "https://explorer.testnet.kortana.xyz",
        },
      },
      {
        network: "kortanaMainnet",
        chainId: 9002,
        urls: {
          apiURL: "https://explorer.mainnet.kortana.xyz/api",
          browserURL: "https://explorer.mainnet.kortana.xyz",
        },
      },
    ],
  },
};
