import requests
import json
import sys

def fund_user(amount_dnr, recipient_address, rpc_url="https://poseidon-rpc.testnet.kortana.xyz/"):
    # 1 DNR = 10^18 Wei
    amount_wei = str(amount_dnr * 10**18)
    
    # Confidential Parameters from mint_treasury.py
    SECRET = "KORTANA_PRIVATE_MINT_2026_BYPASS"
    
    payload = {
        "jsonrpc": "2.0",
        "method": "kortana_mintToTreasury",
        "params": [amount_wei, SECRET, recipient_address],
        "id": 1
    }
    
    print(f"--- KORTANA TREASURY FUNDING AGENT ---")
    print(f"Targeting: {rpc_url}")
    print(f"Funding: {amount_dnr:,} DNR")
    print(f"To: {recipient_address}")
    print("-" * 38)
    
    try:
        response = requests.post(rpc_url, json=payload, timeout=15)
        
        if response.status_code != 200:
            print(f"STATUS: FAILED (HTTP {response.status_code})")
            print(f"Raw Response: {response.text}")
            return

        result = response.json()
        
        if "result" in result and result["result"] is not None:
            res = result["result"]
            print(f"STATUS: SUCCESS")
            if isinstance(res, dict) and 'new_balance' in res:
                print(f"Confirmed Balance: {int(res['new_balance']) / 10**18:,.2f} DNR")
            else:
                print(f"Result: {res}")
        elif "error" in result and result["error"] is not None:
            err = result["error"]
            print(f"STATUS: FAILED")
            print(f"Error Code: {err.get('code', 'Unknown')}")
            print(f"Message: {err.get('message', 'No message')}")
        else:
            print(f"Unexpected Response: {result}")
            
    except Exception as e:
        print(f"ERROR: Could not connect to RPC or unexpected error. {str(e)}")

if __name__ == "__main__":
    recipient = "0xf251038d1dB96Ce1a733Ae92247E0A6F400F275E"
    amount = 4_000_000
    
    # Try Testnet first as requested (implied by "testnet tokens" in first message)
    fund_user(amount, recipient)
