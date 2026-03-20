package main

import (
	"context"
	"fmt"
	"math/big"
	"dnrs_sdk" // Assumes it is placed in GOPATH or handled via go.mod
)

func main() {
	rpc := "https://poseidon-rpc.testnet.kortana.xyz/"
	sdk, err := dnrs_sdk.NewDNRSSDK(rpc)
	if err != nil {
		fmt.Printf("Error creating SDK: %v\n", err)
		return
	}

	address := "0xf251038d1dB96Ce1a733Ae92247E0A6F400F275E"
	ctx := context.Background()
	balance, err := sdk.GetBalance(ctx, address)
	if err != nil {
		fmt.Printf("Error getting balance: %v\n", err)
		return
	}

	fmt.Println("--- DNRS Golang SDK Test ---")
	fmt.Printf("Account: %s\n", address)
	fmt.Printf("Balance: %s DNRS\n", balance.String())
}
