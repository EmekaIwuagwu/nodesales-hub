require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    hardhat: {},
    kortana_testnet: {
      url: "https://poseidon-rpc.testnet.kortana.xyz",
      chainId: 72511,
      accounts: [PRIVATE_KEY],
      gas: 6000000,
      gasPrice: 1,
      timeout: 120000,
    },
    kortana_mainnet: {
      url: "https://zeus-rpc.mainnet.kortana.xyz",
      chainId: 9002,
      accounts: [PRIVATE_KEY],
      gas: 6000000,
      gasPrice: 1,
      timeout: 120000,
    },
  },
  paths: {
    sources:   "./contracts",
    tests:     "./contracts/test",
    cache:     "./cache",
    artifacts: "./artifacts",
  },
};
