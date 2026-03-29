import os
from flask import Flask, request, jsonify, render_template_string
from web3 import Web3
from web3.middleware import geth_poa_middleware

app = Flask(__name__)

# Environment variables injected by Vercel
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
NFT_ADDRESS = os.getenv("NFT_ADDRESS")
RPC_URL = os.getenv("RPC_URL", "https://poseidon-rpc.testnet.kortana.xyz")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "kortana123") 

# Connect Web3 v5
w3 = Web3(Web3.HTTPProvider(RPC_URL))
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

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

nft_contract = w3.eth.contract(address=w3.toChecksumAddress(NFT_ADDRESS)) if NFT_ADDRESS else None

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kortana License Node Admin Minter</title>
    <style>
        body { margin: 0; padding: 0; background: #0a0f1e; color: #fff; font-family: 'Inter', system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .container { background: rgba(14, 165, 233, 0.05); border: 1px solid rgba(14, 165, 233, 0.3); border-radius: 20px; padding: 40px; width: 100%; max-width: 500px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5); }
        .header { text-align: center; margin-bottom: 30px; }
        .title { color: #0ea5e9; font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px; }
        .subtitle { color: #94a3b8; font-size: 14px; margin: 0; }
        .form-group { margin-bottom: 20px; }
        label { display: block; color: #cbd5e1; font-size: 12px; text-transform: uppercase; font-weight: 600; margin-bottom: 8px; letter-spacing: 1px; }
        input[type="text"], input[type="password"] { width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.3); border: 1px solid #1e293b; color: #fff; padding: 12px 16px; border-radius: 8px; font-family: monospace; font-size: 14px; }
        input:focus { outline: none; border-color: #0ea5e9; }
        .radios { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .radios label { display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); padding: 12px; border: 1px solid #1e293b; border-radius: 8px; cursor: pointer; color: #94a3b8; text-transform: none; font-size: 14px; }
        .radios input[type="radio"] { display: none; }
        .radios input[type="radio"]:checked + label { background: rgba(14, 165, 233, 0.1); border-color: #0ea5e9; color: #fff; }
        .btn-submit { background: linear-gradient(90deg, #0ea5e9, #6366f1); border: none; color: white; padding: 16px; width: 100%; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; text-transform: uppercase; margin-top: 20px; }
        .status-box { margin-top: 25px; padding: 15px; border-radius: 8px; font-size: 14px; text-align: center; display: none; word-wrap: break-word; }
        .status-box.error { background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #fca5a5; display: block; }
        .status-box.success { background: rgba(34, 197, 94, 0.1); border: 1px solid #22c55e; color: #86efac; display: block; }
        .config-status { text-align: center; margin-bottom: 25px; font-size: 12px; padding: 10px; border-radius: 6px; }
        .config-ok { background: rgba(34, 197, 94, 0.1); color: #86efac; border: 1px solid rgba(34, 197, 94, 0.3); }
        .config-bad { background: rgba(239, 68, 68, 0.1); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">License Activator</h1>
            <p class="subtitle">Internal Kortana Foundation Utility</p>
        </div>
        {% if configured %}
            <div class="config-status config-ok">
                ✅ Connected to {{ rpc }}<br>
                NFT Contract: {{ address[-6:] }}
            </div>
        {% else %}
            <div class="config-status config-bad">
                ⚠️ WARNING: Missing Vercel Environment Variables.
            </div>
        {% endif %}
        <form id="mintForm">
            <div class="form-group">
                <label>Admin Password</label>
                <input type="password" id="password" required>
            </div>
            <div class="form-group">
                <label>Buyer Wallet Address</label>
                <input type="text" id="buyerAddress" placeholder="0x..." required pattern="^0x[a-fA-F0-9]{40}$">
            </div>
            <div class="form-group">
                <label>Select Node Tier</label>
                <div class="radios">
                    <input type="radio" name="tier" id="t0" value="0" checked><label for="t0">Tier 0 (Genesis)</label>
                    <input type="radio" name="tier" id="t1" value="1"><label for="t1">Tier 1 (Early)</label>
                    <input type="radio" name="tier" id="t2" value="2"><label for="t2">Tier 2 (Full)</label>
                    <input type="radio" name="tier" id="t3" value="3"><label for="t3">Tier 3 (Premium)</label>
                </div>
            </div>
            <button type="submit" class="btn-submit" id="submitBtn">Issue License</button>
            <div id="statusOutput" class="status-box"></div>
        </form>
    </div>
    <script>
        document.getElementById('mintForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('submitBtn');
            const statusBox = document.getElementById('statusOutput');
            const buyer = document.getElementById('buyerAddress').value.trim();
            const password = document.getElementById('password').value.trim();
            const tier = document.querySelector('input[name="tier"]:checked').value;
            btn.disabled = true; btn.innerText = "MINTING...";
            statusBox.style.display = "none";
            try {
                const res = await fetch('/api/mint', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ buyer, tier, password })
                });
                const data = await res.json();
                statusBox.className = "status-box " + (res.ok ? "success" : "error");
                statusBox.innerHTML = res.ok ? `<strong>${data.message}</strong><br><br>TX: ${data.txHash}` : data.error;
            } catch (err) {
                statusBox.className = "status-box error"; statusBox.innerText = "Connection failed.";
            } finally {
                btn.disabled = false; btn.innerText = "Issue License";
            }
        });
    </script>
</body>
</html>
"""

@app.route("/", methods=["GET", "POST"])
def home():
    is_configured = bool(PRIVATE_KEY and NFT_ADDRESS and w3.isConnected())
    return render_template_string(HTML_TEMPLATE, configured=is_configured, rpc=RPC_URL, address=NFT_ADDRESS)

@app.route("/api/mint", methods=["POST"])
def mint_node():
    data = request.json
    auth_pass = data.get("password")
    buyer = data.get("buyer")
    tier = str(data.get("tier"))
    
    if auth_pass != ADMIN_PASSWORD:
        return jsonify({"success": False, "error": "Unauthorized. Incorrect admin password."}), 401
    if not w3.isConnected() or not nft_contract:
        return jsonify({"success": False, "error": "Blockchain RPC disconnected or NFT_ADDRESS unset."}), 500
        
    try:
        checksummed_buyer = w3.toChecksumAddress(buyer)
        account = w3.eth.account.from_key(PRIVATE_KEY)
        nonce = w3.eth.getTransactionCount(account.address)
        
        tx = nft_contract.functions.mintLicense(
            checksummed_buyer, int(tier)
        ).buildTransaction({
            'chainId': w3.eth.chain_id,
            'gas': 2000000,
            'gasPrice': w3.toWei('1', 'gwei'),
            'nonce': nonce,
        })
        
        signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
        tx_hash = w3.eth.sendRawTransaction(signed_tx.rawTransaction)
        
        return jsonify({
            "success": True, 
            "message": f"License (Tier {tier}) successfully broadcasted to {buyer}.",
            "txHash": w3.toHex(tx_hash)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True, port=5000)
