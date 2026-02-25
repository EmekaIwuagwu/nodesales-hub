import requests
import json

def test_rpc():
    url = "http://127.0.0.1:8545"
    payload = {
        "jsonrpc": "2.0",
        "method": "eth_sendRawTransaction",
        "params": ["0x1234"],
        "id": 1
    }
    
    response = requests.post(url, json=payload)
    print("Response Status Code:", response.status_code)
    print("Response JSON:", json.dumps(response.json(), indent=2))

if __name__ == "__main__":
    test_rpc()
