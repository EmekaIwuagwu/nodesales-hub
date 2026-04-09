import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import * as dotenv from "dotenv";

dotenv.config();

const privateKey = process.env.PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10
          },
          evmVersion: "cancun"
        }
      }
    ]
  },
  networks: {
    kortanaTestnet: {
      type: "http",
      url: process.env.TESTNET_RPC || "https://poseidon-rpc.testnet.kortana.xyz/",
      chainId: 72511,
      accounts: privateKey ? [privateKey] : []
    },
    kortanaMainnet: {
      type: "http",
      url: process.env.MAINNET_RPC || "https://zeus-rpc.mainnet.kortana.xyz",
      chainId: 9002,
      accounts: privateKey ? [privateKey] : []
    }
  }
};

export default config;
