require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    networks: {
        kortana_testnet: {
            url: "https://poseidon-rpc.testnet.kortana.xyz/",
            chainId: 72511,
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
        },
        kortana_mainnet: {
            url: "https://zeus-rpc.mainnet.kortana.xyz",
            chainId: 9002,
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
        }
    }
};
