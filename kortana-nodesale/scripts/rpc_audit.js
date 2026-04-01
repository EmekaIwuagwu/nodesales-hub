import { ethers } from 'ethers';

async function main() {
    const rpc = "https://poseidon-rpc.testnet.kortana.xyz/";
    const provider = new ethers.JsonRpcProvider(rpc);
    
    const CONTRACT_ADDRESS = "0x2333B951635Ce16A452BbeE8034AFbfA081Da856";
    const USER_ADDRESS = "0x5A0f90EB1CC1154b237EE7c0941391Ee1757051D";
    
    console.log(`--- DIRECT JSON-RPC AUDIT ---`);
    const cBal = await provider.send("eth_getBalance", [CONTRACT_ADDRESS, "latest"]);
    const uBal = await provider.send("eth_getBalance", [USER_ADDRESS, "latest"]);
    
    console.log(`Contract: ${ethers.formatUnits(BigInt(cBal), 18)} DNR`);
    console.log(`User    : ${ethers.formatUnits(BigInt(uBal), 18)} DNR`);
}

main().catch(console.error);
