// cmd/test_sdk/main.go — Kortana DNRS Go SDK integration test.
// Run: go run ./cmd/test_sdk
package main

import (
	"context"
	"fmt"
	"math/big"

	dnrs "github.com/kortana/dnrs-sdk-go"
)

func main() {
	ctx := context.Background()

	fmt.Println("═══════════════════════════════════")
	fmt.Println("  Kortana DNRS — Go SDK Test Suite")
	fmt.Println("═══════════════════════════════════")

	// ── 1. Testnet balance check ─────────────────────────────────
	fmt.Println("\n[1] Connecting to Kortana Testnet...")
	sdk, err := dnrs.NewDNRSSDK("KORTANA_TESTNET")
	if err != nil {
		fmt.Printf("    Connection error: %v\n", err)
		return
	}

	address := "0xf251038d1dB96Ce1a733Ae92247E0A6F400F275E"
	balance, err := sdk.GetBalance(ctx, address)
	if err != nil {
		fmt.Printf("    GetBalance error: %v\n", err)
	} else {
		// Convert wei → ether for display
		etherBalance := new(big.Float).Quo(
			new(big.Float).SetInt(balance),
			new(big.Float).SetInt(new(big.Int).Exp(big.NewInt(10), big.NewInt(18), nil)),
		)
		fmt.Printf("    Address : %s\n", address)
		fmt.Printf("    Balance : %s DNRS\n", etherBalance.Text('f', 6))
	}

	// ── 2. Mainnet config display ─────────────────────────────────
	fmt.Println("\n[2] Mainnet Network Config...")
	mainnetConfig := dnrs.Networks["KORTANA_MAINNET"]
	fmt.Printf("    RPC     : %s\n", mainnetConfig.RPCUrl)
	fmt.Printf("    ChainID : %d\n", mainnetConfig.ChainID)
	fmt.Printf("    DNRS    : %s\n", mainnetConfig.DNRSAddr)

	// ── 3. Transfer explanation ───────────────────────────────────
	fmt.Println("\n[3] Transfer — To send DNRS:")
	fmt.Println("    txHash, err := sdk.SendTransfer(ctx, \"<privateKeyHex>\", \"<toAddress>\", amount)")
	fmt.Println("    amount is in wei — use big.NewInt(1e18) for 1 DNRS")

	fmt.Println("\n✅  Go SDK test complete.")
}
