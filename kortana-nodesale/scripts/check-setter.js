import { ethers } from 'ethers';

async function main() {
    const RPC_URL = "https://poseidon-rpc.testnet.kortana.xyz/";
    const PRIVATE_KEY = "0x0ce974795717622ea3c0429e580a4e25a71585a389e05b7f87167b87b5ff65d4";
    const CONTRACT_ADDRESS = "0x2333B951635Ce16A452BbeE8034AFbfA081Da856";

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    const iface = new ethers.Interface([
        "function EPOCH_DURATION() view returns (uint256)",
        "function setEpochDuration(uint256 newDuration) external", // Wait! Did I add this function??
    ]);
    
    // Let's check the contract for a setter.
}

main().catch(console.error);
