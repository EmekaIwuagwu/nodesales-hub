# Kortana DNRS — Final SDK Unified Examples

This document demonstrates how to perform **Balance Checks** and **Transfers** using the 100% implemented DNRS SDKs across all 5 languages.

---

## ⚛ React JS (npm)
### Balance Check & Transfer
```javascript
import { useDNRS } from '@kortana/dnrs-sdk';

const { getBalance, transferDNRS } = useDNRS();

// Check Balance
const bal = await getBalance("0xYourAddress");
console.log(`Balance: ${ethers.formatEther(bal)} DNRS`);

// Transfer (Requires Metamask/Browser Signer)
const tx = await transferDNRS("0xRecipient", 10.5); // 10.5 DNRS
await tx.wait();
```

---

## 🐍 Python (pip)
### Balance Check & Transfer
```python
from dnrs_sdk import DNRSSDK

sdk = DNRSSDK("https://poseidon-rpc.testnet.kortana.xyz/")

# Check Balance
bal = sdk.get_balance("0xAddress")
print(f"Current Balance: {bal} DNRS")

# Signed Transfer
private_key = "0x..." 
receipt = sdk.transfer(private_key, "0xRecipient", 50.0)
```

---

## 🐹 Golang (go get)
### Balance Check & Transfer
```go
import (
    "context"
    "dnrs_sdk"
)

sdk, _ := dnrs_sdk.NewDNRSSDK("https://poseidon-rpc.testnet.kortana.xyz/")
ctx := context.Background()

// 1. Get Balance
balance, _ := sdk.GetBalance(ctx, "0xAddress")

// 2. Full Signed Transfer (EIP-155)
txHash, _ := sdk.SendTransfer(ctx, "YourPrivateKey", "0xRecipient", amountBigInt)
```

---

## 🔷 C# (.NET / NuGet)
### Balance Check & Transfer
```csharp
using Kortana.DNRS.SDK;

// Initialize with Private Key for transfers
var sdk = new DNRSSDK("https://poseidon-rpc.testnet.kortana.xyz/", "0xYourPrivateKey");

// 1. Get Balance
decimal balance = await sdk.GetBalanceAsync("0xAddress");

// 2. Transfer
string txHash = await sdk.TransferAsync("0xRecipient", 100.0m);
```

---

## 💎 Ruby (Gem)
### Balance Check & Transfer
```ruby
require 'dnrs_sdk'

sdk = Kortana::DNRS::SDK.new("https://poseidon-rpc.testnet.kortana.xyz/", "YourPrivateKey")

# 1. Get Balance
balance = sdk.get_balance("0xAddress")

# 2. Transfer
sdk.transfer("0xRecipient", 25.0)
```

---

## 📂 SDK Directory Structure
*   `sdks/react/`: React Context & Hooks
*   `sdks/python/`: Python Web3 Wrapper
*   `sdks/golang/`: Go ethclient Wrapper
*   `sdks/csharp/`: Nethereum SDK
*   `sdks/ruby/`: Ruby Eth Gem SDK
