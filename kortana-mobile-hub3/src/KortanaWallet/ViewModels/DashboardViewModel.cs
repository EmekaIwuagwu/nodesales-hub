using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;
using KortanaWallet.Models;
using KortanaWallet.ViewModels.Base;
using KortanaWallet.Services;
using System.Threading.Tasks;
using Microcharts;
using SkiaSharp;
using System.Collections.Generic;
using System.Linq;

namespace KortanaWallet.ViewModels
{
    public partial class DashboardViewModel : BaseViewModel
    {
        private readonly IWalletService _walletService;
        private readonly ITokenService _tokenService;
        private readonly IPriceService _priceService;
        private readonly ITransactionService _transactionService;
        private readonly INetworkService _networkService;

        [ObservableProperty] private Chart _portfolioHistoryChart;
        [ObservableProperty] private decimal _totalBalanceUsd;
        [ObservableProperty] private string _nativeBalance;
        [ObservableProperty] private string _walletAddressPill;
        [ObservableProperty] private string _portfolioChangeText;
        [ObservableProperty] private bool _isPositiveChange;
        [ObservableProperty] private Network _currentNetwork;

        public ObservableCollection<Token> Assets { get; } = new();
        public ObservableCollection<Transaction> RecentTransactions { get; } = new();

        public DashboardViewModel(
            IWalletService walletService,
            ITokenService tokenService,
            IPriceService priceService,
            ITransactionService transactionService,
            INetworkService networkService)
        {
            _walletService = walletService;
            _tokenService = tokenService;
            _priceService = priceService;
            _transactionService = transactionService;
            _networkService = networkService;

            Title = "Dashboard";
            CurrentNetwork = _networkService.SelectedNetwork;
            
            // Initial placeholders
            TotalBalanceUsd = 0;
            NativeBalance = $"0.00 {CurrentNetwork?.Symbol ?? "KOR"}";
            WalletAddressPill = "Loading...";
        }

        [RelayCommand]
        public async Task RefreshAsync()
        {
            await ExecuteSafeAsync(async () =>
            {
                if (!_walletService.IsWalletInitialized)
                {
                    WalletAddressPill = "Wallet not initialized";
                    return;
                }

                string address = await _walletService.GetCurrentAddressAsync();
                WalletAddressPill = $"{address.Substring(0, 6)}...{address.Substring(address.Length - 4)}";

                // Fetch Native Balance
                var balanceWei = await _walletService.GetBalanceAsync(address);
                var balanceNative = (double)Nethereum.Web3.Web3.Convert.FromWei(balanceWei);
                NativeBalance = $"{balanceNative:N4} {CurrentNetwork.Symbol}";

                // Fetch Prices
                var coinId = CurrentNetwork.Symbol.ToLower() == "kor" ? "kortana" : "ethereum"; // map symbols to coingecko ids
                var nativePrice = await _priceService.GetPriceAsync(coinId);
                TotalBalanceUsd = (decimal)balanceNative * nativePrice;

                // Simple Chart Generation (Randomized for show)
                GenerateMockChart();

                // Assets fetch
                Assets.Clear();
                Assets.Add(new Token 
                { 
                    Name = CurrentNetwork.Name, 
                    Symbol = CurrentNetwork.Symbol, 
                    Balance = balanceNative, 
                    PriceUsd = nativePrice,
                    PriceChange24h = 0.0 // To be fetched
                });

                // Transactions
                var txs = await _transactionService.GetTransactionHistoryAsync(address, 0, 5);
                RecentTransactions.Clear();
                foreach (var tx in txs) RecentTransactions.Add(tx);
            });
        }

        private void GenerateMockChart()
        {
            PortfolioHistoryChart = new LineChart
            {
                Entries = new List<ChartEntry>
                {
                    new(1000) { Color = SKColor.Parse("#2563EB") },
                    new(1100) { Color = SKColor.Parse("#2563EB") },
                    new(1050) { Color = SKColor.Parse("#2563EB") },
                    new(1200) { Color = SKColor.Parse("#2563EB") },
                    new(1180) { Color = SKColor.Parse("#2563EB") },
                    new((float)TotalBalanceUsd) { Color = SKColor.Parse("#2563EB") }
                },
                LineMode = LineMode.Spline,
                LineSize = 8,
                PointMode = PointMode.None,
                BackgroundColor = SKColors.Transparent,
            };
        }
    }
}
