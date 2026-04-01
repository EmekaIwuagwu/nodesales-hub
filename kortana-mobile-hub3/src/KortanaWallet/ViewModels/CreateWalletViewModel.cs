using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using KortanaWallet.Services;
using KortanaWallet.ViewModels.Base;
using System.Collections.ObjectModel;

namespace KortanaWallet.ViewModels
{
    public partial class CreateWalletViewModel : BaseViewModel
    {
        private readonly IWalletService _walletService;
        private readonly IStorageService _storageService;

        [ObservableProperty] private int _currentStep = 1;
        [ObservableProperty] private string _password;
        [ObservableProperty] private string _confirmPassword;
        [ObservableProperty] private string _mnemonic;
        [ObservableProperty] private string _passwordStrength;

        public double Progress => CurrentStep / 2.0;

        public ObservableCollection<string> MnemonicWords { get; } = new();

        public CreateWalletViewModel(IWalletService walletService, IStorageService storageService)
        {
            _walletService = walletService;
            _storageService = storageService;
            Title = "Create Wallet";
        }

        [RelayCommand]
        private async Task NextStepAsync()
        {
            if (string.IsNullOrEmpty(Password) || Password != ConfirmPassword)
            {
                ErrorMessage = "Passwords do not match or are empty";
                return;
            }

            await ExecuteSafeAsync(async () =>
            {
                Mnemonic = await _walletService.GenerateMnemonicAsync();
                MnemonicWords.Clear();
                foreach (var word in Mnemonic.Split(' '))
                {
                    MnemonicWords.Add(word);
                }
                CurrentStep = 2;
                OnPropertyChanged(nameof(Progress));
            });
        }

        [RelayCommand]
        private async Task CompleteBackupAsync()
        {
            await ExecuteSafeAsync(async () =>
            {
                // Save encrypted wallet
                await _storageService.SaveEncryptedMnemonicAsync(Mnemonic, Password);
                await _storageService.SavePinHashAsync(Password); // Using password as PIN for simplicity here
                
                // Initialize wallet service
                var privateKey = await _walletService.GetPrivateKeyFromMnemonicAsync(Mnemonic);
                await _walletService.InitializeAsync(privateKey, "https://rpc.kortana.network");
                
                await Shell.Current.GoToAsync("//Dashboard");
            });
        }
    }
}
