using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace KortanaWallet.Services
{
    public interface IPriceService
    {
        Task<decimal> GetPriceAsync(string coinId, string currency = "usd");
    }

    public class PriceService : IPriceService
    {
        private readonly HttpClient _httpClient;
        private const string BaseUrl = "https://api.coingecko.com/api/v3/";

        public PriceService()
        {
            _httpClient = new HttpClient { BaseAddress = new Uri(BaseUrl) };
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "KortanaWallet");
        }

        public async Task<decimal> GetPriceAsync(string coinId, string currency = "usd")
        {
            try
            {
                // GET https://api.coingecko.com/api/v3/simple/price?ids=kortana,ethereum&vs_currencies=usd
                var response = await _httpClient.GetFromJsonAsync<Dictionary<string, Dictionary<string, decimal>>>(
                    $"simple/price?ids={coinId}&vs_currencies={currency}");

                if (response != null && response.ContainsKey(coinId) && response[coinId].ContainsKey(currency))
                {
                    return response[coinId][currency];
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Price fetch error: {ex.Message}");
            }

            return 0;
        }
    }
}
