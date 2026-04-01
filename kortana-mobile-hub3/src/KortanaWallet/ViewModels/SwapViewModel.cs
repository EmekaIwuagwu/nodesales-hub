using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using KortanaWallet.Models;
using KortanaWallet.ViewModels.Base;
using System.Collections.ObjectModel;
using System.Threading.Tasks;

namespace KortanaWallet.ViewModels
{
    public partial class SwapViewModel : BaseViewModel
    {
        [ObservableProperty] private Token _fromToken;
        [ObservableProperty] private Token _toToken;
        [ObservableProperty] private decimal _fromAmount;
        [ObservableProperty] private decimal _toAmount;
        [ObservableProperty] private double _exchangeRate = 0.0004;

        public ObservableCollection<Token> AvailableTokens { get; } = new();

        public SwapViewModel()
        {
            Title = "Swap";
            
            // Mock data
            FromToken = new Token { Symbol = "KOR", Name = "Kortana", Balance = 100 };
            ToToken = new Token { Symbol = "ETH", Name = "Ethereum", Balance = 0 };
        }

        [RelayCommand]
        private void FlipTokens()
        {
            var temp = FromToken;
            FromToken = ToToken;
            ToToken = temp;
        }

        [RelayCommand]
        private async Task SwapAsync()
        {
            await ExecuteSafeAsync(async () =>
            {
                await Task.Delay(2000);
                // Execute swap logic via Uniswap/KortanaSwap router
            });
        }
    }
}
