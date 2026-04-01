from web3 import Web3

RPC_URL = "https://poseidon-rpc.testnet.kortana.xyz/"
w3 = Web3(Web3.HTTPProvider(RPC_URL))

target = "0xf251038d1dB96Ce1a733Ae92247E0A6F400F275E"

if w3.is_connected():
    bal = w3.eth.get_balance(target)
    print(f"Address {target} Balance: {w3.from_wei(bal, 'ether')} DNR")
else:
    print("Failed to connect!")
