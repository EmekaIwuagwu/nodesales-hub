import os
from flask import Flask, request, render_template, jsonify
from web3 import Web3
from web3.middleware import geth_poa_middleware

# Resolve dynamic paths for Vercel's Serverless Build output
current_dir = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, 
            template_folder=os.path.join(current_dir, "../templates"), 
            static_folder=os.path.join(current_dir, "../static"))

# Environment variables injected by Vercel
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
NFT_ADDRESS = os.getenv("NFT_ADDRESS")
RPC_URL = os.getenv("RPC_URL", "https://zeus-rpc.mainnet.kortana.xyz")
# Optional extra security for the admin panel
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "kortana123") 

# Connect Web3
w3 = Web3(Web3.HTTPProvider(RPC_URL))
# Inject PoA middleware required for Kortana blocks
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

# Minimal ABI for KortanaLicenseNFT mintLicense function
ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "buyer", "type": "address"},
            {"internalType": "uint8", "name": "tier", "type": "uint8"}
        ],
        "name": "mintLicense",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

nft_contract = w3.eth.contract(address=w3.to_checksum_address(NFT_ADDRESS)) if NFT_ADDRESS else None

@app.route("/", methods=["GET"])
def home():
    is_configured = bool(PRIVATE_KEY and NFT_ADDRESS and w3.is_connected())
    return render_template("index.html", configured=is_configured, rpc=RPC_URL, address=NFT_ADDRESS)

@app.route("/api/mint", methods=["POST"])
def mint_node():
    data = request.json
    
    auth_pass = data.get("password")
    buyer = data.get("buyer")
    tier = str(data.get("tier"))
    
    if auth_pass != ADMIN_PASSWORD:
        return jsonify({"success": False, "error": "Unauthorized. Incorrect admin password."}), 401
        
    if not w3.is_connected() or not nft_contract:
        return jsonify({"success": False, "error": "Blockchain RPC disconnected or NFT_ADDRESS unset."}), 500
        
    try:
        checksummed_buyer = w3.to_checksum_address(buyer)
        account = w3.eth.account.from_key(PRIVATE_KEY)
        nonce = w3.eth.get_transaction_count(account.address)
        
        # Enforce legacy transaction explicitly for Kortana RPC constraints
        tx = nft_contract.functions.mintLicense(
            checksummed_buyer, 
            int(tier)
        ).build_transaction({
            'chainId': w3.eth.chain_id,
            'gas': 2000000,
            'gasPrice': w3.to_wei('1', 'gwei'),
            'nonce': nonce,
        })
        
        signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        block_hash_hex = w3.to_hex(tx_hash)
        
        # Return success immediately (do not await wait_for_transaction_receipt to avoid Vercel 10s lambda timeouts)
        return jsonify({
            "success": True, 
            "message": f"License (Tier {tier}) successfully broadcasted to {buyer}.",
            "txHash": block_hash_hex
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

# Required for Vercel
if __name__ == "__main__":
    app.run(debug=True, port=5000)
