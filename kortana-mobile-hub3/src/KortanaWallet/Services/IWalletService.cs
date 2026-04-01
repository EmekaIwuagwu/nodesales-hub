using System.Threading.Tasks;
using System.Collections.Generic;
using KortanaWallet.Models;
using Nethereum.RPC.Eth.DTOs;
using System.Numerics;

namespace KortanaWallet.Services
{
    public interface IWalletService
    {
        bool IsWalletInitialized { get; }
        Task<string> GetCurrentAddressAsync();
        Task InitializeAsync(string privateKey, string rpcUrl);
        Task<BigInteger> GetBalanceAsync(string address = null);
        Task<string> SendTransactionAsync(string toAddress, BigInteger amountInWei);
        Task<string> SignMessageAsync(string message);
        Task<string> GenerateMnemonicAsync();
        Task<string> GetPrivateKeyFromMnemonicAsync(string mnemonic, string path = null);
    }
}
