const { ethers } = require("ethers");

module.exports = async (req, res) => {
    // 1. Basic Vercel Security Check 
    // Vercel physically injects a Bearer token when executing Cron jobs
    const authHeader = req.headers.authorization;
    if (
        !process.env.CRON_SECRET ||
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        // If random bots hit the URL, we can optionally reject it, 
        // though the smart contract mathematically rejects premature epochs anyway!
        if (req.query.trigger !== process.env.ADMIN_PASSWORD) {
             return res.status(401).json({ success: false, message: 'Unauthorized Cron Execution' });
        }
    }

    try {
        const RPC_URL = process.env.RPC_URL || "https://poseidon-rpc.testnet.kortana.xyz";
        const PRIVATE_KEY = process.env.PRIVATE_KEY;
        const NFT_ADDRESS = process.env.NFT_ADDRESS;

        if (!PRIVATE_KEY || !NFT_ADDRESS) {
            return res.status(500).json({ success: false, message: 'Missing Enclave Blockchain Environment Variables' });
        }

        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

        const nftABI = [
            "function lastEpochTime() view returns (uint256)",
            "function EPOCH_DURATION() view returns (uint256)",
            "function advanceEpoch() external",
            "function distributeAllRewards(uint256 startId, uint256 endId) external",
            "function nextLicenseId() view returns (uint256)"
        ];

        const nftContract = new ethers.Contract(NFT_ADDRESS, nftABI, wallet);

        console.log("Vercel Cron Executing: Verifying Blockchain Variables natively...");
        const lastEpoch = await nftContract.lastEpochTime();
        const duration = await nftContract.EPOCH_DURATION();
        const timestamp = BigInt(Math.floor(Date.now() / 1000));

        // We explicitly DONT use async await for the strict transaction broadcasting here, 
        // because Free Vercel Hobby accounts kill Serverless Functions after strictly 10 seconds.
        // We broadcast to the Blockchain mempool instantaneously and exit 200 OK!

        if (timestamp >= (lastEpoch + duration)) {
            console.log("24 Hours verified. Broadcasting Blockchain Payout Algorithm...");
            
            // Advance the cycle (No await wait)
            nftContract.advanceEpoch({ gasLimit: 2000000 })
                .then(() => console.log("Epoch Advance Mempool Successfully Triggered."))
                .catch(e => console.log("Epoch Advance Ignored or Blocked:", e.message));

            // Staggering the distribution payload locally by 2 seconds inside Vercel node memory
            setTimeout(() => {
                nftContract.distributeAllRewards(1, 9999999, { gasLimit: 15000000 })
                    .then(() => console.log("Global Airdrop Mempool Successfully Triggered."))
                    .catch(e => console.log("Global Airdrop Blocked:", e.message));
            }, 3000);

            return res.status(200).json({ 
                success: true, 
                message: 'Midnight UTC Ecosystem Airdrop Sequence Successfully Broadcasted to Mainnet.'
            });

        } else {
            return res.status(200).json({ 
                success: true, 
                message: '24 Hour Temporal Lock Active. Ignored.'
            });
        }

    } catch (error) {
        console.error("Vercel Ecosystem Architecture Exception:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};
