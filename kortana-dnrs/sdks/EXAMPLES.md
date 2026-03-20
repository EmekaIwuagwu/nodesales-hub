# Kortana DNRS — SDK Integration Guide

This document demonstrates how to use the fully implemented DNRS SDK in your frontend, backend, or automation scripts.

---

## ⚛ React JS (Frontend)

The React SDK provides a custom hook `useDNRS` for easy integration with Metamask.

### Installation
```bash
npm install ethers
```

### Usage
```javascript
import { useDNRS } from './hooks/useDNRS';

function WalletComponent() {
  const { getBalance, stakeDNR, loading } = useDNRS();
  const [balance, setBalance] = useState("0");

  const refreshBalance = async () => {
    const bal = await getBalance("0xYourAddress");
    setBalance(ethers.formatEther(bal));
  };

  const handleStake = async () => {
    // Stake 100 DNR - Fully implemented function
    await stakeDNR(100); 
    alert("Staked Successfully!");
  };

  return (
    <div>
      <p>DNRS Balance: {balance}</p>
      <button onClick={handleStake} disabled={loading}>
        Stake 100 DNR
      </button>
    </div>
  );
}
```

---

## 🐍 Python (Automation / Scripts)

The Python SDK is ideal for trading bots or monitoring scripts for **MyHealthFriend**.

### Installation
```bash
pip install web3
```

### Usage
```python
from dnrs_sdk import DNRSSDK

# Initialize SDK with Kortana Testnet RPC
rpc_url = "https://poseidon-rpc.testnet.kortana.xyz/"
sdk = DNRSSDK(rpc_url)

# 1. Get DNRS Balance
balance = sdk.get_balance("0xf251038d1dB96Ce1a733Ae92247E0A6F400F275E")
print(f"Current Balance: {balance} DNRS")

# 2. Perform Transfer
private_key = "0xYourPrivateKey"
# Complete signed transaction execution
receipt = sdk.transfer(private_key, "0xRecipientAddress", 50.0)
print(f"Transaction successful in block: {receipt.blockNumber}")
```

---

## 🐹 Golang (Backend / Microservices)

The Golang SDK uses `go-ethereum` for high-performance blockchain interactions.

### Installation
```bash
go get github.com/ethereum/go-ethereum
```

### Usage
```go
package main

import (
	"context"
	"fmt"
	"math/big"
	"dnrs_sdk"
)

func main() {
	rpc := "https://poseidon-rpc.testnet.kortana.xyz/"
	sdk, _ := dnrs_sdk.NewDNRSSDK(rpc)
	
	ctx := context.Background()
	
    // 1. Get Balance
	balance, _ := sdk.GetBalance(ctx, "0xAddress")
	fmt.Printf("Balance: %s DNRS\n", balance.String())

    // 2. Transfer (Signed)
    // Fully implemented with EIP-155 signing
    txHash, _ := sdk.SendTransfer(ctx, "YourPrivateKeyHex", "0xTo", big.NewInt(1000000000000000000))
    fmt.Printf("TX Hash: %s\n", txHash)
}
```

---

## 🌐 Network Configuration

Always ensure you connect to the primary **Kortana Testnet** nodes:

*   **RPC URL**: `https://poseidon-rpc.testnet.kortana.xyz/`
*   **Chain ID**: `72511`
*   **Symbol**: `DNR`
*   **Explorer**: `https://explorer.testnet.kortana.xyz/`
