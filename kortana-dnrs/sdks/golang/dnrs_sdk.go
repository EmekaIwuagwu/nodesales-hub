package dnrs

import (
	"context"
	"crypto/ecdsa"
	"math/big"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/ethereum/go-ethereum/core/types"
)

// DNRS Addresses (Testnet)
const (
	DNRSAddress      = "0xa1E9679c7AE524a09AbE34464A99d8D5daaEA92B"
	BoardroomAddress = "0x216E22FbBC3f891B38434bC92F3512B55Fd02C3f"
)

type DNRSSDK struct {
	client *ethclient.Client
}

func NewDNRSSDK(rpcURL string) (*DNRSSDK, error) {
	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		return nil, err
	}
	return &DNRSSDK{client: client}, nil
}

// GetBalance returns the DNRS balance of an account
func (s *DNRSSDK) GetBalance(ctx context.Context, account string) (*big.Int, error) {
	address := common.HexToAddress(account)
    
	// 0x70a08231 is the keccak256 hash of "balanceOf(address)" (first 4 bytes)
	methodID := []byte{0x70, 0xa0, 0x82, 0x31}
	paddedAddress := common.LeftPadBytes(address.Bytes(), 32)
	data := append(methodID, paddedAddress...)

	dnrsAddr := common.HexToAddress(DNRSAddress)
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

// SendTransfer signs and sends a DNRS transfer transaction
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

	// 0xa9059cbb is code for "transfer(address,uint256)"
	methodID := []byte{0xa9, 0x05, 0x9c, 0xbb}
	toAddr := common.HexToAddress(to)
	paddedTo := common.LeftPadBytes(toAddr.Bytes(), 32)
	paddedAmount := common.LeftPadBytes(amount.Bytes(), 32)
	
	data := append(methodID, paddedTo...)
	data = append(data, paddedAmount...)

	dnrsAddr := common.HexToAddress(DNRSAddress)
	chainID, err := s.client.NetworkID(ctx)
	if err != nil {
		return "", err
	}

	tx := types.NewTransaction(nonce, dnrsAddr, big.NewInt(0), uint64(100000), gasPrice, data)
	signedTx, err := types.SignTx(tx, types.NewEIP155Signer(chainID), privateKey)
	if err != nil {
		return "", err
	}

	err = s.client.SendTransaction(ctx, signedTx)
	if err != nil {
		return "", err
	}

	return signedTx.Hash().Hex(), nil
}
