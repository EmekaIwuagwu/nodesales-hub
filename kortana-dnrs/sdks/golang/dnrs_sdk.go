// Package dnrs provides the Kortana DNRS Stablecoin SDK for Go.
// Supports both Kortana Testnet (chainID 72511) and Mainnet (chainID 9002).
//
// Usage:
//
//	sdk, _ := dnrs.NewDNRSSDK("KORTANA_TESTNET")
//	balance, _ := sdk.GetBalance(ctx, "0xAddress")
package dnrs

import (
	"context"
	"crypto/ecdsa"
	"math/big"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

// NetworkConfig holds connection and contract details for one network.
type NetworkConfig struct {
	RPCUrl    string
	DNRSAddr  string
	Boardroom string
	ChainID   int64
}

// Networks lists all supported Kortana networks.
var Networks = map[string]NetworkConfig{
	"KORTANA_TESTNET": {
		RPCUrl:    "https://poseidon-rpc.testnet.kortana.xyz/",
		DNRSAddr:  "0xa1E9679c7AE524a09AbE34464A99d8D5daaEA92B",
		Boardroom: "0x216E22FbBC3f891B38434bC92F3512B55Fd02C3f",
		ChainID:   72511,
	},
	"KORTANA_MAINNET": {
		RPCUrl:    "https://rpc.kortana.xyz/",
		DNRSAddr:  "0x0000000000000000000000000000000000000000",
		Boardroom: "0x0000000000000000000000000000000000000000",
		ChainID:   9002,
	},
}

// DNRSSDK is the main entry point for DNRS blockchain interactions.
type DNRSSDK struct {
	client *ethclient.Client
	config NetworkConfig
}

// NewDNRSSDK initialises the SDK for the given network name ("KORTANA_TESTNET" or "KORTANA_MAINNET").
func NewDNRSSDK(networkName string) (*DNRSSDK, error) {
	config, ok := Networks[networkName]
	if !ok {
		config = Networks["KORTANA_TESTNET"]
	}
	client, err := ethclient.Dial(config.RPCUrl)
	if err != nil {
		return nil, err
	}
	return &DNRSSDK{client: client, config: config}, nil
}

// GetBalance returns the DNRS token balance (in wei) for a given wallet address.
func (s *DNRSSDK) GetBalance(ctx context.Context, account string) (*big.Int, error) {
	address := common.HexToAddress(account)

	// keccak256("balanceOf(address)") first 4 bytes = 0x70a08231
	methodID := []byte{0x70, 0xa0, 0x82, 0x31}
	paddedAddress := common.LeftPadBytes(address.Bytes(), 32)
	data := append(methodID, paddedAddress...)

	dnrsAddr := common.HexToAddress(s.config.DNRSAddr)
	msg := ethereum.CallMsg{
		To:   &dnrsAddr,
		Data: data,
	}

	result, err := s.client.CallContract(ctx, msg, nil)
	if err != nil {
		return nil, err
	}

	return new(big.Int).SetBytes(result), nil
}

// SendTransfer signs and broadcasts a DNRS ERC-20 transfer using EIP-155.
// privateKeyHex must be a hex-encoded 32-byte private key (without 0x prefix).
func (s *DNRSSDK) SendTransfer(ctx context.Context, privateKeyHex string, to string, amount *big.Int) (string, error) {
	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		return "", err
	}

	publicKey := privateKey.Public().(*ecdsa.PublicKey)
	fromAddress := crypto.PubkeyToAddress(*publicKey)

	nonce, err := s.client.PendingNonceAt(ctx, fromAddress)
	if err != nil {
		return "", err
	}

	gasPrice, err := s.client.SuggestGasPrice(ctx)
	if err != nil {
		return "", err
	}

	// keccak256("transfer(address,uint256)") first 4 bytes = 0xa9059cbb
	methodID := []byte{0xa9, 0x05, 0x9c, 0xbb}
	toAddr := common.HexToAddress(to)
	paddedTo := common.LeftPadBytes(toAddr.Bytes(), 32)
	paddedAmount := common.LeftPadBytes(amount.Bytes(), 32)

	data := append(methodID, paddedTo...)
	data = append(data, paddedAmount...)

	dnrsAddr := common.HexToAddress(s.config.DNRSAddr)
	chainID := big.NewInt(s.config.ChainID)

	tx := types.NewTransaction(nonce, dnrsAddr, big.NewInt(0), uint64(120000), gasPrice, data)
	signedTx, err := types.SignTx(tx, types.NewEIP155Signer(chainID), privateKey)
	if err != nil {
		return "", err
	}

	if err = s.client.SendTransaction(ctx, signedTx); err != nil {
		return "", err
	}

	return signedTx.Hash().Hex(), nil
}
