using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using KortanaWallet.Services;
using KortanaWallet.ViewModels.Base;

namespace KortanaWallet.ViewModels
{
    public partial class LoginViewModel : BaseViewModel
    {
        private readonly IStorageService _storageService;
        private readonly IBiometricService _biometricService;
        private readonly IWalletService _walletService;

        [ObservableProperty] private string _password = "";
        [ObservableProperty] private string _walletAddressHeader;

        public LoginViewModel(IStorageService storageService, 
                            IBiometricService biometricService, 
                            IWalletService walletService)
        {
            _storageService = storageService;
            _biometricService = biometricService;
            _walletService = walletService;
            Title = "Unlock Wallet";
        }

        [RelayCommand]
        private async Task AuthenticateAsync()
        {
            if (string.IsNullOrEmpty(Password)) return;

            await ExecuteSafeAsync(async () =>
            {
                bool isValid = await _storageService.ValidatePinAsync(Password);
                if (isValid)
                {
                    await LoginSuccessAsync(Password);
                }
                else
                {
                    ErrorMessage = "Invalid Password";
                    Password = "";
                }
            });
        }

        [RelayCommand]
        private async Task BiometricLoginAsync()
        {
            await ExecuteSafeAsync(async () =>
            {
                bool authenticated = await _biometricService.AuthenticateAsync("Unlock your Kortana Wallet");
                if (authenticated)
                {
                    // For biometric success, we could recover a session token or use a separate key
                    // For now, this is a placeholder for full biometric integration
                }
            });
        }

        private async Task LoginSuccessAsync(string password)
        {
            var mnemonic = await _storageService.RecoverMnemonicAsync(password);
            var privateKey = await _walletService.GetPrivateKeyFromMnemonicAsync(mnemonic);
            await _walletService.InitializeAsync(privateKey, "https://rpc.kortana.network");
            
            await Shell.Current.GoToAsync("//Dashboard");
        }

        [RelayCommand]
        private async Task ResetAsync()
        {
            if (await Shell.Current.DisplayAlert("Reset Wallet", "This will permanently clear this wallet from your device. Do you have your recovery phrase?", "Reset", "Cancel"))
            {
                await _storageService.ClearAllAsync();
                await Shell.Current.GoToAsync("//Onboarding");
            }
        }
    }
}
