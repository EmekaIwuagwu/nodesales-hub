"""
Kortana DNRS — Python SDK Full Test Script
Run: python test_sdk.py
"""
import sys
import os

# Allow running from any directory
sys.path.insert(0, os.path.dirname(__file__))

from dnrs_sdk import DNRSSDK, NETWORKS

def print_separator():
    print("─" * 45)

def test_network(sdk, network_label, address):
    print(f"\n[{network_label}] Balance Check")
    try:
        balance = sdk.get_balance(address)
        print(f"  Address : {address}")
        print(f"  Balance : {balance} DNRS")
    except Exception as e:
        print(f"  Connection error: {e}")

def test_transfer_build(sdk, from_address):
    """Demonstrates how a transfer would be built without broadcasting."""
    from web3 import Web3
    print(f"\n[Transfer] Constructing transaction for {from_address}")
    amount_wei = Web3.to_wei(1.0, 'ether')
    to_address  = "0x0000000000000000000000000000000000000001"
    tx = sdk.dnrs.functions.transfer(to_address, amount_wei).build_transaction({
        'from': from_address,
        'nonce': sdk.w3.eth.get_transaction_count(from_address),
        'gas': 120000,
        'gasPrice': sdk.w3.eth.gas_price
    })
    print(f"  To      : {tx['to']}")
    print(f"  Gas     : {tx['gas']}")
    print(f"  ChainId : {tx.get('chainId', 'auto')}")
    print(f"  Data    : {tx['data'][:34]}...")
    print(f"  (Sign with: sdk.w3.eth.account.sign_transaction(tx, private_key))")

def main():
    print("═" * 45)
    print("  Kortana DNRS — Python SDK Test Suite")
    print("═" * 45)

    account_address = "0xf251038d1dB96Ce1a733Ae92247E0A6F400F275E"

    # Testnet
    print_separator()
    testnet_sdk = DNRSSDK(network_name='KORTANA_TESTNET')
    print(f"Connected to: {NETWORKS['KORTANA_TESTNET']['rpc_url']}")
    test_network(testnet_sdk, "TESTNET", account_address)

    # Mainnet config check (no live RPC call since contracts not yet deployed on mainnet)
    print_separator()
    print(f"\n[MAINNET] Network Config")
    print(f"  RPC URL : {NETWORKS['KORTANA_MAINNET']['rpc_url']}")
    print(f"  DNRS    : {NETWORKS['KORTANA_MAINNET']['dnrs']}")
    print(f"  Chain ID: 9002")

    # Transfer Demo
    print_separator()
    test_transfer_build(testnet_sdk, account_address)

    print("\n")
    print_separator()
    print("✅  All Python SDK tests complete.")
    print_separator()

if __name__ == "__main__":
    main()
