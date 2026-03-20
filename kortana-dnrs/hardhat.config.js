import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    kortanaTestnet: {
      url: process.env.KORTANA_TESTNET_RPC || "https://poseidon-rpc.testnet.kortana.xyz/",
      chainId: 72511,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    },
    kortanaMainnet: {
      url: process.env.KORTANA_MAINNET_RPC || "https://zeus-rpc.mainnet.kortana.xyz",
      chainId: 9002,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    },
  },
};
