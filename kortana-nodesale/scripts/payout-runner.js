import { ethers } from 'ethers';

async function main() {
    const RPC_URL = "https://poseidon-rpc.testnet.kortana.xyz/";
    const PRIVATE_KEY = "0x0ce974795717622ea3c0429e580a4e25a71585a389e05b7f87167b87b5ff65d4";
    const CONTRACT_ADDRESS = "0x2333B951635Ce16A452BbeE8034AFbfA081Da856";
    const USER_ADDRESS = "0x5A0f90EB1CC1154b237EE7c0941391Ee1757051D";

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    const iface = new ethers.Interface([
        "function currentEpoch() view returns (uint256)",
        "function lastEpochTime() view returns (uint256)",
        "function EPOCH_DURATION() view returns (uint256)",
        "function advanceEpoch() external",
        "function distributeAllRewards(uint256 start, uint256 end) external",
        "function totalDistributed() view returns (uint256)",
        "function lastClaimedEpoch(uint256) view returns (uint256)"
    ]);

    const epochRaw = await provider.send("eth_call", [{ to: CONTRACT_ADDRESS, data: iface.encodeFunctionData("currentEpoch") }, "latest"]);
    const currentEpoch = BigInt(epochRaw);
    console.log(`Current Epoch: ${currentEpoch}`);

    const lastClaimRaw = await provider.send("eth_call", [{ to: CONTRACT_ADDRESS, data: iface.encodeFunctionData("lastClaimedEpoch", [1]) }, "latest"]);
    console.log(`Node #1 lastClaimedEpoch: ${BigInt(lastClaimRaw)}`);

    const lastRaw = await provider.send("eth_call", [{ to: CONTRACT_ADDRESS, data: iface.encodeFunctionData("lastEpochTime") }, "latest"]);
    const last = BigInt(lastRaw);
    
    const durRaw = await provider.send("eth_call", [{ to: CONTRACT_ADDRESS, data: iface.encodeFunctionData("EPOCH_DURATION") }, "latest"]);
    const dur = BigInt(durRaw);
    
    const now = BigInt(Math.floor(Date.now() / 1000));

    if (now >= last + dur) {
        console.log("Advancing Epoch...");
        try {
            const tx1 = await wallet.sendTransaction({
                to: CONTRACT_ADDRESS,
                data: iface.encodeFunctionData("advanceEpoch"),
                type: 0,
                gasLimit: 2000000,
                gasPrice: ethers.parseUnits("1", "gwei")
            });
            await tx1.wait();
            console.log("Epoch Advanced!");
        } catch(advErr) {
            console.log("Epoch already advanced or not yet ready:", advErr.shortMessage || advErr.message);
        }
    } else {
        console.log(`Time window not met yet: ${last + dur - now}s left.`);
    }

    console.log("Distributing Rewards...");
    try {
        const tx2 = await wallet.sendTransaction({
            to: CONTRACT_ADDRESS,
            data: iface.encodeFunctionData("distributeAllRewards", [1, 9999]),
            type: 0,
            gasLimit: 10000000,
            gasPrice: ethers.parseUnits("1", "gwei")
        });
        const rec = await tx2.wait();
        console.log("Rewards Distributed! TX Status:", rec.status);
    } catch(err) {
        console.error("Distribution ERROR:", err.message);
    }
    
    const distRaw = await provider.send("eth_call", [{ to: CONTRACT_ADDRESS, data: iface.encodeFunctionData("totalDistributed") }, "latest"]);
    console.log(`New Total Distributed: ${ethers.formatEther(BigInt(distRaw || "0x0"))} DNR`);
    
    const userBal = await provider.send("eth_getBalance", [USER_ADDRESS, "latest"]);
    console.log(`User Balance: ${ethers.formatUnits(BigInt(userBal || "0x0"), 18)} DNR`);
}

main().catch(console.error);
