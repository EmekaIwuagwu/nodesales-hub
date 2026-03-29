const { ethers } = require('ethers');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { password, buyer, tier } = req.body;

    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    const NFT_ADDRESS = process.env.NFT_ADDRESS;
    const RPC_URL = process.env.RPC_URL || "https://poseidon-rpc.testnet.kortana.xyz/";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "kortana123";

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ success: false, error: 'Unauthorized. Incorrect admin password.' });
    }

    if (!PRIVATE_KEY || !NFT_ADDRESS) {
        return res.status(500).json({ success: false, error: 'Backend misconfigured. Missing Vercel Environment variables.' });
    }

    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

        const abi = [
            "function mintLicense(address buyer, uint8 tier) external"
        ];
        const contract = new ethers.Contract(NFT_ADDRESS, abi, wallet);

        // Enforce legacy style directly to avoid EIP-1559 RPC limitations
        const tx = await contract.mintLicense(buyer, parseInt(tier), {
            gasLimit: 3000000,
            gasPrice: ethers.parseUnits("1", "gwei"),
            type: 0 // Legacy mode forced
        });

        // Resolve instantly for UI so Vercel lambdas don't timeout waiting for blocks
        return res.status(200).json({
            success: true,
            message: `License (Tier ${tier}) successfully broadcasted to ${buyer}.`,
            txHash: tx.hash
        });
        
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message || error.reason || "Unknown execution error" });
    }
}
