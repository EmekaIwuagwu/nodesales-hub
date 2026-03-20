using System;
using System.Collections.Generic;
using System.Numerics;
using System.Threading.Tasks;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using Nethereum.Hex.HexTypes;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Contracts;

namespace Kortana.DNRS.SDK
{
    public class NetworkConfig
    {
        public string RPCUrl { get; set; }
        public string DNRSAddr { get; set; }
        public string Boardroom { get; set; }
        public int ChainID { get; set; }
    }

    public class DNRSSDK
    {
        private readonly Web3 _web3;
        private readonly NetworkConfig _config;

        public static readonly Dictionary<string, NetworkConfig> Networks = new Dictionary<string, NetworkConfig>
        {
            { "KORTANA_TESTNET", new NetworkConfig {
                RPCUrl = "https://poseidon-rpc.testnet.kortana.xyz/",
                DNRSAddr = "0xa1E9679c7AE524a09AbE34464A99d8D5daaEA92B",
                Boardroom = "0x216E22FbBC3f891B38434bC92F3512B55Fd02C3f",
                ChainID = 72511
            }},
            { "KORTANA_MAINNET", new NetworkConfig {
                RPCUrl = "https://rpc.kortana.xyz/",
                DNRSAddr = "0x0000000000000000000000000000000000000000",
                Boardroom = "0x0000000000000000000000000000000000000000",
                ChainID = 9002
            }}
        };

        public DNRSSDK(string networkName = "KORTANA_TESTNET", string privateKey = null)
        {
            if (!Networks.TryGetValue(networkName, out _config))
            {
                _config = Networks["KORTANA_TESTNET"];
            }

            if (string.IsNullOrEmpty(privateKey))
            {
                _web3 = new Web3(_config.RPCUrl);
            }
            else
            {
                var account = new Account(privateKey, _config.ChainID);
                _web3 = new Web3(account, _config.RPCUrl);
            }
        }

        public async Task<decimal> GetBalanceAsync(string walletAddress)
        {
            var function = _web3.Eth.GetContractQueryHandler<BalanceOfFunction>();
            var balanceWei = await function.QueryAsync<BigInteger>(_config.DNRSAddr, new BalanceOfFunction { Owner = walletAddress });
            return Web3.Convert.FromWei(balanceWei);
        }

        public async Task<string> TransferAsync(string toAddress, decimal amountEther)
        {
            var amountWei = Web3.Convert.ToWei(amountEther);
            var transferFunction = new TransferFunction
            {
                To = toAddress,
                Value = amountWei
            };

            var handler = _web3.Eth.GetContractTransactionHandler<TransferFunction>();
            return await handler.SendRequestAsync(_config.DNRSAddr, transferFunction);
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
