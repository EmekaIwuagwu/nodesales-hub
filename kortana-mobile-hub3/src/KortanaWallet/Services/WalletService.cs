using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using Nethereum.HdWallet;
using Nethereum.Hex.HexTypes;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Util;
using Nethereum.Signer;
using NBitcoin;
using System.Numerics;
using KortanaWallet.Core.Constants;

namespace KortanaWallet.Services
{
    public class WalletService : IWalletService
    {
        private Web3 _web3;
        private Account _account;
        public bool IsWalletInitialized => _web3 != null && _account != null;

        public async Task InitializeAsync(string privateKey, string rpcUrl)
        {
            _account = new Account(privateKey);
            _web3 = new Web3(_account, rpcUrl);
            
            // Default to EIP-1559 for modern EVM networks (like Kortana)
            _web3.TransactionManager.UseLegacyAsDefault = false;
        }

        public async Task<string> GetCurrentAddressAsync()
        {
            return _account?.Address ?? string.Empty;
        }

        public async Task<BigInteger> GetBalanceAsync(string address = null)
        {
            if (!IsWalletInitialized) return 0;
            
            string targetAddress = address ?? _account.Address;
            var balanceValue = await _web3.Eth.GetBalance.SendRequestAsync(targetAddress);
            return balanceValue.Value;
        }

        public async Task<string> SendTransactionAsync(string toAddress, BigInteger amountInWei)
        {
            if (!IsWalletInitialized) throw new InvalidOperationException("Wallet not initialized");

            var txInput = new TransactionInput
            {
                To = toAddress,
                Value = new HexBigInteger(amountInWei),
                From = _account.Address
            };

            // 1. Estimate Gas
            var gasEstimation = await _web3.Eth.TransactionManager.EstimateGasAsync(txInput);
            txInput.Gas = gasEstimation;

            // 2. Fetch Fee Data (EIP-1559)
            var feeData = await _web3.Eth.FeeHistory.SendRequestAsync(new HexBigInteger(1), BlockParameter.CreateLatest(), new decimal[] { 25.0m });
            var baseFeeLastBlock = feeData.BaseFeePerGas.Last().Value;
            
            // Buffer base fee by 25% (standard practice)
            txInput.MaxFeePerGas = new HexBigInteger(baseFeeLastBlock * 125 / 100);
            
            // Priority fee (Tipped to miner/validator) - default standard
            txInput.MaxPriorityFeePerGas = new HexBigInteger(2000000000); // 2 Gwei
            
            // 3. Send Transaction
            return await _web3.Eth.TransactionManager.SendTransactionAsync(txInput);
        }

        public async Task<string> SignMessageAsync(string message)
        {
            if (!IsWalletInitialized) throw new InvalidOperationException("Wallet not initialized");
            
            var signer = new EthereumMessageSigner();
            return signer.EncodeUTF8AndSign(message, new EthECKey(_account.PrivateKey));
        }

        public async Task<string> GenerateMnemonicAsync()
        {
            // Generates 12 words by default using BIP-39 logic in Nethereum
            return await Task.Run(() => 
            {
                var wallet = new Wallet(Wordlist.English, WordCount.Twelve);
                return string.Join(" ", wallet.Words);
            });
        }

        public async Task<string> GetPrivateKeyFromMnemonicAsync(string mnemonic, string path = null)
        {
            path ??= AppConstants.StandardDerivationPath;
            var wallet = new Wallet(mnemonic, null, path);
            var account = wallet.GetAccount(0); // m/44'/60'/0'/0/0
            return account.PrivateKey;
        }
    }
}
