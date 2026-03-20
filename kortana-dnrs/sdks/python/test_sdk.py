from dnrs_sdk import DNRSSDK

def run_test():
    # Initialize SDK with Kortana Testnet RPC
    rpc_url = "https://poseidon-rpc.testnet.kortana.xyz/"
    sdk = DNRSSDK(rpc_url)
    
    # Check Balance Example
    target_addr = "0xf251038d1dB96Ce1a733Ae92247E0A6F400F275E"
    balance = sdk.get_balance(target_addr)
    
    print("-" * 30)
    print("DNRS Python SDK Test Results")
    print("-" * 30)
    print(f"Target Account: {target_addr}")
    print(f"Current Balance: {balance} DNRS")
    print("-" * 30)

if __name__ == "__main__":
    run_test()
