using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using KortanaWallet.Models;
using KortanaWallet.ViewModels.Base;
using KortanaWallet.Services;
using System.Collections.ObjectModel;
using System.Threading.Tasks;

namespace KortanaWallet.ViewModels
{
    public partial class TokenListViewModel : BaseViewModel
    {
        private readonly ITokenService _tokenService;
        private readonly IWalletService _walletService;

        public ObservableCollection<Token> Tokens { get; } = new();

        public TokenListViewModel(ITokenService tokenService, IWalletService walletService)
        {
            _tokenService = tokenService;
            _walletService = walletService;
            Title = "Assets";
        }

        [RelayCommand]
        private async Task LoadTokensAsync()
        {
            await ExecuteSafeAsync(async () =>
            {
                var address = await _walletService.GetCurrentAddressAsync();
                
                // Add native token manually (fetch from provider)
                var nativeToken = new Token { Name = "Kortana", Symbol = "KOR", Balance = (double)await _walletService.GetBalanceAsync() };
                Tokens.Clear();
                Tokens.Add(nativeToken);
                
                // Other ERC-20s would be loaded here from storage or DB
            });
        }

        [RelayCommand]
        private async Task ImportTokenAsync()
        {
            await Shell.Current.GoToAsync("ImportTokenPage");
        }
    }
}
