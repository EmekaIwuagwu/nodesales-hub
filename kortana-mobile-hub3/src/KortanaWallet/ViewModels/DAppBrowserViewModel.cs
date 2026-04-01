using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using KortanaWallet.ViewModels.Base;
using KortanaWallet.Services;
using System.Threading.Tasks;

namespace KortanaWallet.ViewModels
{
    public partial class DAppBrowserViewModel : BaseViewModel
    {
        private readonly IWalletService _walletService;
        private readonly INetworkService _networkService;

        [ObservableProperty] private string _currentUrl = "https://google.com";
        [ObservableProperty] private bool _isLoading;
        [ObservableProperty] private string _browserTitle = "DApp Browser";

        public DAppBrowserViewModel(IWalletService walletService, INetworkService networkService)
        {
            _walletService = walletService;
            _networkService = networkService;
            Title = "DApp Browser";
        }

        [RelayCommand]
        public async Task NavigateToUrlAsync(string url)
        {
            if (string.IsNullOrEmpty(url)) return;
            
            // Normalize URL
            if (!url.StartsWith("http")) url = "https://" + url;
            
            CurrentUrl = url;
            await Task.CompletedTask;
        }

        [RelayCommand]
        public void GoBack()
        {
            // Navigation handled in view
        }

        [RelayCommand]
        public void Reload()
        {
            // Handled in view
        }

        [RelayCommand]
        public async Task RequestConnectAsync()
        {
            // Mock connection request from DApp
            bool confirmed = await Shell.Current.DisplayAlert("Connect Wallet", 
                "Google.com wants to connect to your wallet.", "Connect", "Cancel");
            
            if (confirmed)
            {
                // Logic to inject EIP-1193 provider normally happens here
            }
        }
    }
}
