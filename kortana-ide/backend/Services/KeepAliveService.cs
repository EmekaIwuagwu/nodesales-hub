using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;

namespace KortanaStudio.Backend.Services
{
    public class KeepAliveService : BackgroundService
    {
        private readonly ILogger<KeepAliveService> _logger;
        private readonly HttpClient _httpClient;
        private readonly string? _url;

        public KeepAliveService(ILogger<KeepAliveService> logger)
        {
            _logger = logger;
            _httpClient = new HttpClient();
            // Render provides RENDER_EXTERNAL_URL in some environments, 
            // otherwise we expect the user to set a KEEP_ALIVE_URL
            _url = Environment.GetEnvironmentVariable("RENDER_EXTERNAL_URL") 
                   ?? Environment.GetEnvironmentVariable("KEEP_ALIVE_URL");
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (string.IsNullOrEmpty(_url))
            {
                _logger.LogWarning("KeepAliveService: No URL configured (RENDER_EXTERNAL_URL or KEEP_ALIVE_URL). Skipping keep-alive pings.");
                return;
            }

            _logger.LogInformation($"KeepAliveService: Starting keep-alive pings to {_url}");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation($"KeepAliveService: Pinging {_url} at {DateTime.UtcNow}");
                    var response = await _httpClient.GetAsync(_url, stoppingToken);
                    _logger.LogInformation($"KeepAliveService: Ping response: {response.StatusCode}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "KeepAliveService: Ping failed");
                }

                // Wait for 10 minutes (Render sleep is usually 15 mins)
                await Task.Delay(TimeSpan.FromMinutes(10), stoppingToken);
            }
        }
    }
}
