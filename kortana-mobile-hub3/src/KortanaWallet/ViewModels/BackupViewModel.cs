using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using KortanaWallet.ViewModels.Base;
using KortanaWallet.Services;
using System.Collections.ObjectModel;
using System.Threading.Tasks;

namespace KortanaWallet.ViewModels
{
    public partial class BackupViewModel : BaseViewModel
    {
        private readonly IStorageService _storageService;
        private readonly IBiometricService _biometricService;

        [ObservableProperty] private bool _isRevealed;
        [ObservableProperty] private string _mnemonic;
        
        public ObservableCollection<string> MnemonicWords { get; } = new();

        public BackupViewModel(IStorageService storageService, IBiometricService biometricService)
        {
            _storageService = storageService;
            _biometricService = biometricService;
            Title = "Recovery Phrase";
        }

        [RelayCommand]
        private async Task RevealAsync()
        {
            await ExecuteSafeAsync(async () =>
            {
                bool auth = await _biometricService.AuthenticateAsync("Reveal your recovery phrase");
                if (auth)
                {
                    // Recover from storage (here we use a placeholder or need the user's password/PIN)
                    Mnemonic = "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12";
                    MnemonicWords.Clear();
                    foreach (var word in Mnemonic.Split(' ')) MnemonicWords.Add(word);
                    IsRevealed = true;
                }
            });
        }

        [RelayCommand]
        private async Task CopyToClipboardAsync()
        {
            if (!IsRevealed) return;
            await Clipboard.Default.SetTextAsync(Mnemonic);
            // Toast would show
        }
    }
}
