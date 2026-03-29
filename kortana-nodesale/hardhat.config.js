import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: {
    version: "0.8.20",
    settings: {
      evmVersion: "paris",
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    testnet: {
        url: "https://poseidon-rpc.testnet.kortana.xyz/",
        chainId: 72511,
        accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    mainnet: {
        url: "https://zeus-rpc.mainnet.kortana.xyz",
        chainId: 9002,
        accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    }
  }
};

export default config;
