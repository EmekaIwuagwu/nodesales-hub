using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using KortanaWallet.Services;
using KortanaWallet.ViewModels.Base;

namespace KortanaWallet.ViewModels
{
    public partial class ImportWalletViewModel : BaseViewModel
    {
        private readonly IWalletService _walletService;
        private readonly IStorageService _storageService;

        [ObservableProperty] private string _mnemonic;
        [ObservableProperty] private string _privateKey;
        [ObservableProperty] private string _password;
        [ObservableProperty] private string _confirmPassword;
        [ObservableProperty] private bool _isMnemonicTab = true;

        public ImportWalletViewModel(IWalletService walletService, IStorageService storageService)
        {
            _walletService = walletService;
            _storageService = storageService;
            Title = "Import Wallet";
        }

        [RelayCommand]
        private async Task ImportAsync()
        {
            if (Password != ConfirmPassword)
            {
                ErrorMessage = "Passwords do not match";
                return;
            }

            await ExecuteSafeAsync(async () =>
            {
                string keyToStore;
                if (IsMnemonicTab)
                {
                    keyToStore = Mnemonic;
                    // Derive to validate it's a correct mnemonic
                    _ = await _walletService.GetPrivateKeyFromMnemonicAsync(mnemonic: Mnemonic);
                }
                else
                {
                    keyToStore = PrivateKey;
                }

                await _storageService.SaveEncryptedMnemonicAsync(keyToStore, Password);
                await _storageService.SavePinHashAsync(Password);
                
                // Initialize and Go
                string privateKey = IsMnemonicTab 
                    ? await _walletService.GetPrivateKeyFromMnemonicAsync(Mnemonic)
                    : PrivateKey;

                await _walletService.InitializeAsync(privateKey, "https://rpc.kortana.network");

                await Shell.Current.GoToAsync("//Dashboard");
            });
        }

        [RelayCommand]
        private void SelectTab(string tab)
        {
            IsMnemonicTab = tab == "mnemonic";
        }
    }
}
