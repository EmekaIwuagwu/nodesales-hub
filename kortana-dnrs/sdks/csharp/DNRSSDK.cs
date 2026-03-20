using System;
using System.Numerics;
using System.Threading.Tasks;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using Nethereum.Hex.HexTypes;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Contracts;

namespace Kortana.DNRS.SDK
{
    /**
     * @title DNRSSDK — C# Integration for Kortana Stablecoin
     * @notice Fully implemented SDK for DNRS transfers and balance monitoring.
     */
    public class DNRSSDK
    {
        private readonly Web3 _web3;
        private const string DNRS_ADDRESS = "0xa1E9679c7AE524a09AbE34464A99d8D5daaEA92B";

        public DNRSSDK(string rpcUrl, string privateKey = null)
        {
            if (string.IsNullOrEmpty(privateKey))
            {
                _web3 = new Web3(rpcUrl);
            }
            else
            {
                var account = new Account(privateKey);
                _web3 = new Web3(account, rpcUrl);
            }
        }

        /**
         * @notice Get DNRS balance for a specific wallet address
         */
        public async Task<decimal> GetBalanceAsync(string walletAddress)
        {
            var function = _web3.Eth.GetContractQueryHandler<BalanceOfFunction>();
            var balanceWei = await function.QueryAsync<BigInteger>(DNRS_ADDRESS, new BalanceOfFunction { Owner = walletAddress });
            return Web3.Convert.FromWei(balanceWei);
        }

        /**
         * @notice Transfer DNRS tokens from the initialized wallet
         */
        public async Task<string> TransferAsync(string toAddress, decimal amountEther)
        {
            var amountWei = Web3.Convert.ToWei(amountEther);
            var transferFunction = new TransferFunction
            {
                To = toAddress,
                Value = amountWei
            };

            var handler = _web3.Eth.GetContractTransactionHandler<TransferFunction>();
            return await handler.SendRequestAsync(DNRS_ADDRESS, transferFunction);
        }

        [Function("balanceOf", "uint256")]
        public class BalanceOfFunction : FunctionMessage
        {
            [Parameter("address", "_owner", 1)]
            public string Owner { get; set; }
        }

        [Function("transfer", "bool")]
        public class TransferFunction : FunctionMessage
        {
            [Parameter("address", "_to", 1)]
            public string To { get; set; }

            [Parameter("uint256", "_value", 2)]
            public BigInteger Value { get; set; }
        }
    }
}
