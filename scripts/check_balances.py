from web3 import Web3
from eth_account import Account

RPC_URL = "https://poseidon-rpc.testnet.kortana.xyz/"
w3 = Web3(Web3.HTTPProvider(RPC_URL))

# Known keys from scripts
keys = [
    "2d502aa349bb96c3676db8fd9ceb611594ca2a6dfbeeb9f2b175bf9116cbcdaa",
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
]

if not w3.is_connected():
    print("Failed to connect!")
    exit()

for key in keys:
    if key.startswith("0x"):
        acc = Account.from_key(key)
    else:
        acc = Account.from_key("0x" + key)
    bal = w3.eth.get_balance(acc.address)
    print(f"Address {acc.address}: {w3.from_wei(bal, 'ether')} DNR")
