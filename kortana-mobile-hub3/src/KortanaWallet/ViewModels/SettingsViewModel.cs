using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using KortanaWallet.ViewModels.Base;
using KortanaWallet.Services;
using System.Threading.Tasks;

namespace KortanaWallet.ViewModels
{
    public partial class SettingsViewModel : BaseViewModel
    {
        private readonly IStorageService _storageService;
        private readonly IBiometricService _biometricService;

        [ObservableProperty] private bool _isBiometricsEnabled;
        [ObservableProperty] private string _currency = "USD";
        [ObservableProperty] private string _appVersion = "1.0.0 (Build 1)";

        public SettingsViewModel(IStorageService storageService, IBiometricService biometricService)
        {
            _storageService = storageService;
            _biometricService = biometricService;
            Title = "Settings";
            
            // Initial state load from storage
        }

        [RelayCommand]
        private async Task ShowRecoveryPhraseAsync()
        {
            await Shell.Current.GoToAsync("BackupPage");
        }

        [RelayCommand]
        private async Task ChangePinAsync()
        {
            // Flow to change existing PIN
        }

        [RelayCommand]
        private async Task ToggleBiometricsAsync(bool enabled)
        {
             // Save to storage and check capability
        }

        [RelayCommand]
        private async Task ManageNetworksAsync()
        {
            await Shell.Current.GoToAsync("NetworkPage");
        }
    }
}
