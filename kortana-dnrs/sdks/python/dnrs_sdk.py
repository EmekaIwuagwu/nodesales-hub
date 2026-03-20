from web3 import Web3

# Testnet Addresses
DNRS_ADDRESS = "0xa1E9679c7AE524a09AbE34464A99d8D5daaEA92B"
BOARDROOM_ADDRESS = "0x216E22FbBC3f891B38434bC92F3512B55Fd02C3f"

# Simple ERC20 ABI Subset
DNRS_ABI = [
    {"constant": True, "inputs": [{"name": "_owner", "type": "address"}], "name": "balanceOf", "outputs": [{"name": "balance", "type": "uint256"}], "type": "function"},
    {"constant": False, "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}], "name": "transfer", "outputs": [{"name": "success", "type": "bool"}], "type": "function"}
]

class DNRSSDK:
    def __init__(self, rpc_url):
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.dnrs = self.w3.eth.contract(address=DNRS_ADDRESS, abi=DNRS_ABI)

    def get_balance(self, account_address):
        """Get the DNRS balance of a wallet."""
        balance_wei = self.dnrs.functions.balanceOf(account_address).call()
        return self.w3.from_wei(balance_wei, 'ether')

    def transfer(self, private_key, to_address, amount_ether):
        """Transfer DNRS from the wallet associated with the private key."""
        account = self.w3.eth.account.from_key(private_key)
        amount_wei = self.w3.to_wei(amount_ether, 'ether')
        
        tx = self.dnrs.functions.transfer(to_address, amount_wei).build_transaction({
            'from': account.address,
            'nonce': self.w3.eth.get_transaction_count(account.address),
            'gas': 100000,
            'gasPrice': self.w3.eth.gas_price
        })
        
        signed_tx = self.w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        return self.w3.eth.wait_for_transaction_receipt(tx_hash)

if __name__ == "__main__":
    # Example usage:
    rpc = "https://poseidon-rpc.testnet.kortana.xyz/"
    sdk = DNRSSDK(rpc)
    
    # Check balance
    addr = "0xf251038d1dB96Ce1a733Ae92247E0A6F400F275E"
    bal = sdk.get_balance(addr)
    print(f"DNRS Balance of {addr}: {bal} DNRS")
