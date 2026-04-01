using Nethereum.Web3;
using Nethereum.ABI.FunctionEncoding.Attributes;
using Nethereum.Contracts;
using System.Numerics;
using KortanaWallet.Models;

namespace KortanaWallet.Services
{
    public interface ITokenService
    {
        Task<double> GetBalanceAsync(string tokenContractAddress, string userAddress);
        Task<Token> GetTokenMetadataAsync(string tokenContractAddress);
    }

    // ABI definitions for ERC-20
    [Function("balanceOf", "uint256")]
    public class BalanceOfFunction : FunctionMessage
    {
        [Parameter("address", "_owner", 1)]
        public string Owner { get; set; }
    }

    [Function("decimals", "uint8")]
    public class DecimalsFunction : FunctionMessage { }

    [Function("symbol", "string")]
    public class SymbolFunction : FunctionMessage { }

    [Function("name", "string")]
    public class NameFunction : FunctionMessage { }

    public class TokenService : ITokenService
    {
        private readonly IWalletService _walletService;
        private Web3 _web3;

        public TokenService(IWalletService walletService)
        {
            _walletService = walletService;
        }

        private void EnsureWeb3()
        {
            // Ideally initialized with current RPC from AppSettings/NetworkService
            _web3 ??= new Web3("https://rpc.kortana.network");
        }

        public async Task<double> GetBalanceAsync(string tokenContractAddress, string userAddress)
        {
            EnsureWeb3();
            var handler = _web3.Eth.GetContractHandler(tokenContractAddress);
            
            var balanceWei = await handler.QueryAsync<BalanceOfFunction, BigInteger>(new BalanceOfFunction { Owner = userAddress });
            var decimals = await handler.QueryAsync<DecimalsFunction, int>();
            
            return (double)Web3.Convert.FromWei(balanceWei, decimals);
        }

        public async Task<Token> GetTokenMetadataAsync(string tokenContractAddress)
        {
            EnsureWeb3();
            var handler = _web3.Eth.GetContractHandler(tokenContractAddress);

            var name = await handler.QueryAsync<NameFunction, string>();
            var symbol = await handler.QueryAsync<SymbolFunction, string>();
            var decimals = await handler.QueryAsync<DecimalsFunction, int>();

            return new Token
            {
                Name = name,
                Symbol = symbol,
                ContractAddress = tokenContractAddress,
                Decimals = decimals
            };
        }
    }
}
