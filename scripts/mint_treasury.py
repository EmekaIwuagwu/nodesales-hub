
import requests
import json
import sys

def mint_to_treasury(amount_dnr, rpc_url="https://zeus-rpc.mainnet.kortana.xyz"):
    # 1 DNR = 10^18 Wei
    amount_wei = str(amount_dnr * 10**18)
    
    # Confidential Parameters
    SECRET = "KORTANA_PRIVATE_MINT_2026_BYPASS"
    TREASURY_ADDR = "0x0d5c1bd818a4086f28314415cb375a937593efab"
    
    payload = {
        "jsonrpc": "2.0",
        "method": "kortana_mintToTreasury",
        "params": [amount_wei, SECRET, TREASURY_ADDR],
        "id": 1
    }
    
    print(f"--- KORTANA OTC MINTING AGENT ---")
    print(f"Targeting: {rpc_url}")
    print(f"Minting: {amount_dnr:,} DNR")
    print(f"To: {TREASURY_ADDR}")
    print("-" * 33)
    
    try:
        response = requests.post(rpc_url, json=payload, timeout=10)
        
        if response.status_code != 200:
            print(f"STATUS: FAILED (HTTP {response.status_code})")
            print(f"Raw Response: {response.text}")
            return

        result = response.json()
        
        if "result" in result and result["result"] is not None:
            res = result["result"]
            print(f"STATUS: SUCCESS")
            print(f"Confirmed Balance: {int(res['new_balance']) / 10**18:,.2f} DNR")
            print(f"Confidential Flag: {res.get('confidential', 'N/A')}")
        elif "error" in result and result["error"] is not None:
            err = result["error"]
            print(f"STATUS: FAILED")
            print(f"Error Code: {err.get('code', 'Unknown')}")
            print(f"Message: {err.get('message', 'No message')}")
        else:
            print(f"Unexpected Response: {result}")
            
    except Exception as e:
        print(f"ERROR: Could not connect to RPC. {str(e)}")

if __name__ == "__main__":
    # Default to 1 Billion DNR
    mint_amount = 1_000_000_000
    
    # Check if a custom URL was provided (e.g., http://localhost:8545)
    url = "https://zeus-rpc.mainnet.kortana.xyz"
    if len(sys.argv) > 1:
        url = sys.argv[1]
        
    mint_to_treasury(mint_amount, url)
