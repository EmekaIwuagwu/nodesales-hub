using System;
using System.Collections.Generic;
using System.Numerics;
using System.Threading.Tasks;
using Nethereum.Web3;
using Nethereum.Contracts;
using Nethereum.ABI.FunctionEncoding.Attributes;
using Nethereum.RPC.Eth.DTOs;

namespace KortanaDNRS
{
    // ── Network config ───────────────────────────────────────────
    class NetworkConfig
    {
        public string RPCUrl    { get; set; }
        public string DNRSAddr  { get; set; }
        public string Explorer  { get; set; }
        public int    ChainID   { get; set; }
    }

    // ── DNRS balanceOf ABI message ───────────────────────────────
    [Function("balanceOf", "uint256")]
    class BalanceOfFunction : FunctionMessage
    {
        [Parameter("address", "_owner", 1)]
        public string Owner { get; set; }
    }

    // ── SDK ───────────────────────────────────────────────────────
    class DNRSSDK
    {
        private readonly Web3 _web3;
        private readonly NetworkConfig _config;

        static readonly Dictionary<string, NetworkConfig> Networks = new()
        {
            ["KORTANA_TESTNET"] = new() {
                RPCUrl   = "https://poseidon-rpc.testnet.kortana.xyz/",
                DNRSAddr = "0xa1E9679c7AE524a09AbE34464A99d8D5daaEA92B",
                Explorer = "https://explorer.testnet.kortana.xyz",
                ChainID  = 72511
            },
            ["KORTANA_MAINNET"] = new() {
                RPCUrl   = "https://zeus-rpc.mainnet.kortana.xyz",
                DNRSAddr = "0x0000000000000000000000000000000000000000",
                Explorer = "https://explorer.mainnet.kortana.xyz",
                ChainID  = 9002
            }
        };

        public DNRSSDK(string networkName = "KORTANA_TESTNET")
        {
            _config = Networks.TryGetValue(networkName, out var cfg) ? cfg : Networks["KORTANA_TESTNET"];
            _web3   = new Web3(_config.RPCUrl);
        }

        public async Task<decimal> GetBalanceAsync(string address)
        {
            var handler = _web3.Eth.GetContractQueryHandler<BalanceOfFunction>();
            var wei = await handler.QueryAsync<BigInteger>(_config.DNRSAddr, new BalanceOfFunction { Owner = address });
            return Web3.Convert.FromWei(wei);
        }

        public NetworkConfig Config => _config;
    }

    // ── Test runner ───────────────────────────────────────────────
    class Program
    {
        static async Task Main()
        {
            Console.WriteLine("═══════════════════════════════════════");
            Console.WriteLine("  Kortana DNRS — C# SDK Test Suite    ");
            Console.WriteLine("═══════════════════════════════════════\n");

            string addr = "0xf251038d1dB96Ce1a733Ae92247E0A6F400F275E";

            // ── 1. Testnet balance ───────────────────────────────
            Console.WriteLine("[1] Testnet — Checking DNRS balance...");
            var testnet = new DNRSSDK("KORTANA_TESTNET");
            try
            {
                decimal bal = await testnet.GetBalanceAsync(addr);
                Console.WriteLine($"    RPC     : {testnet.Config.RPCUrl}");
                Console.WriteLine($"    ChainID : {testnet.Config.ChainID}");
                Console.WriteLine($"    Address : {addr}");
                Console.WriteLine($"    Balance : {bal} DNRS");
                Console.WriteLine($"    Explorer: {testnet.Config.Explorer}");
            }
            catch (Exception ex) { Console.WriteLine($"    Error: {ex.Message}"); }

            // ── 2. Mainnet config display ────────────────────────
            Console.WriteLine("\n[2] Mainnet Network Config:");
            var mainnet = new DNRSSDK("KORTANA_MAINNET");
            Console.WriteLine($"    RPC     : {mainnet.Config.RPCUrl}");
            Console.WriteLine($"    ChainID : {mainnet.Config.ChainID}");
            Console.WriteLine($"    Explorer: {mainnet.Config.Explorer}");

            // ── 3. Transfer instructions ─────────────────────────
            Console.WriteLine("\n[3] Transfer — requires private key signer:");
            Console.WriteLine("    (Nethereum transfer with Account class)");
            Console.WriteLine("    var account = new Nethereum.Web3.Accounts.Account(\"0xPrivKey\", chainId);");
            Console.WriteLine("    var web3    = new Web3(account, rpcUrl);");
            Console.WriteLine("    var handler = web3.Eth.GetContractTransactionHandler<TransferFunction>();");
            Console.WriteLine("    var txHash  = await handler.SendRequestAsync(dnrsAddr, new TransferFunction { To = \"0xRecipient\", Value = amount });");

            Console.WriteLine("\n✅  C# SDK test complete.\n");
        }
    }
}
