using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;
using KortanaWallet.Models;
using KortanaWallet.ViewModels.Base;
using KortanaWallet.Services;
using System.Threading.Tasks;

namespace KortanaWallet.ViewModels
{
    public partial class SendViewModel : BaseViewModel
    {
        private readonly IWalletService _walletService;
        private readonly ITokenService _tokenService;
        private readonly IQrCodeService _qrCodeService;

        [ObservableProperty] private string _recipientAddress;
        [ObservableProperty] private decimal _amount;
        [ObservableProperty] private Token _selectedToken;
        [ObservableProperty] private string _estimatedGasFeeUsd = "$0.00";
        [ObservableProperty] private bool _isAddressValid;

        public ObservableCollection<Token> AvailableTokens { get; } = new();

        public SendViewModel(IWalletService walletService, ITokenService tokenService, IQrCodeService qrCodeService)
        {
            _walletService = walletService;
            _tokenService = tokenService;
            _qrCodeService = qrCodeService;
            Title = "Send";
        }

        [RelayCommand]
        public async Task RefreshBalancesAsync()
        {
            await ExecuteSafeAsync(async () =>
            {
                if (!_walletService.IsWalletInitialized) return;
                
                // For simplification, fetch native balance
                var balanceWei = await _walletService.GetBalanceAsync();
                var balanceNative = (double)Nethereum.Web3.Web3.Convert.FromWei(balanceWei);

                AvailableTokens.Clear();
                AvailableTokens.Add(new Token { Name = "Native Token", Symbol = "KOR", Balance = balanceNative });
                SelectedToken = AvailableTokens[0];
            });
        }

        [RelayCommand]
        public async Task ReviewAsync()
        {
            if (string.IsNullOrEmpty(RecipientAddress) || Amount <= 0)
            {
                ErrorMessage = "Invalid address or amount";
                return;
            }

            await ExecuteSafeAsync(async () =>
            {
                // Preliminary validation
                bool confirmed = await Shell.Current.DisplayAlert("Confirm Transaction", 
                    $"Are you sure you want to send {Amount} {SelectedToken.Symbol} to {RecipientAddress}?", 
                    "Send", "Cancel");

                if (confirmed)
                {
                    // Convert amount to Wei
                    var amountWei = Nethereum.Web3.Web3.Convert.ToWei(Amount);
                    var txHash = await _walletService.SendTransactionAsync(RecipientAddress, amountWei);
                    
                    await Shell.Current.DisplayAlert("Success", $"Transaction sent! Hash: {txHash}", "OK");
                    await Shell.Current.GoToAsync("..");
                }
            });
        }
        
        [RelayCommand]
        public async Task ScanQRCodeAsync()
        {
            var result = await _qrCodeService.ScanAsync();
            if (!string.IsNullOrEmpty(result))
            {
                RecipientAddress = result;
            }
        }
    }
}
