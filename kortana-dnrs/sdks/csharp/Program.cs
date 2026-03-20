using System;
using System.Threading.Tasks;
using System.Numerics;
using Kortana.DNRS.SDK;

namespace Kortana.DNRS.Examples
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("═══════════════════════════════════════");
            Console.WriteLine("  Kortana DNRS — C# SDK Test Suite   ");
            Console.WriteLine("═══════════════════════════════════════\n");

            // ── 1. Testnet Balance Check ─────────────────────────
            Console.WriteLine("[1] Connecting to Kortana Testnet...");
            var sdk = new DNRSSDK("KORTANA_TESTNET");
            string address = "0xf251038d1dB96Ce1a733Ae92247E0A6F400F275E";

            try
            {
                decimal balance = await sdk.GetBalanceAsync(address);
                Console.WriteLine($"    Address : {address}");
                Console.WriteLine($"    Balance : {balance} DNRS");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"    Error: {ex.Message}");
            }

            // ── 2. Mainnet Config ────────────────────────────────
            Console.WriteLine("\n[2] Mainnet Config:");
            var mainnet = DNRSSDK.Networks["KORTANA_MAINNET"];
            Console.WriteLine($"    RPC     : {mainnet.RPCUrl}");
            Console.WriteLine($"    ChainID : {mainnet.ChainID}");
            Console.WriteLine($"    DNRS    : {mainnet.DNRSAddr}");

            // ── 3. Transfer Demo ─────────────────────────────────
            Console.WriteLine("\n[3] Transfer — To send DNRS:");
            Console.WriteLine("    var sdkWithKey = new DNRSSDK(\"KORTANA_TESTNET\", \"0xYourPrivateKey\");");
            Console.WriteLine("    string txHash = await sdkWithKey.TransferAsync(\"0xRecipient\", 10.0m);");
            Console.WriteLine("    Console.WriteLine($\"TX: {txHash}\");");

            Console.WriteLine("\n✅  C# SDK test complete.\n");
        }
    }
}
