using System;
using System.Threading.Tasks;
using Kortana.DNRS.SDK;

namespace Kortana.DNRS.Examples
{
    class Program
    {
        static async Task Main(string[] args)
        {
            string rpcUrl = "https://poseidon-rpc.testnet.kortana.xyz/";
            string walletAddress = "0xf251038d1dB96Ce1a733Ae92247E0A6F400F275E";

            // Initialize SDK
            var sdk = new DNRSSDK(rpcUrl);

            Console.WriteLine("--- DNRS C# SDK Test ---");
            try
            {
                decimal balance = await sdk.GetBalanceAsync(walletAddress);
                Console.WriteLine($"Account: {walletAddress}");
                Console.WriteLine($"Balance: {balance} DNRS");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
            Console.WriteLine("-------------------------");
        }
    }
}
