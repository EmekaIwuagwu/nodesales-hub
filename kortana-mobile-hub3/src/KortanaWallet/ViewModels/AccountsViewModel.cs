using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using KortanaWallet.Models;
using KortanaWallet.ViewModels.Base;
using KortanaWallet.Services;
using System.Collections.ObjectModel;
using System.Threading.Tasks;

namespace KortanaWallet.ViewModels
{
    public partial class AccountsViewModel : BaseViewModel
    {
        private readonly IWalletService _walletService;

        public ObservableCollection<WalletAccount> Accounts { get; } = new();

        public AccountsViewModel(IWalletService walletService)
        {
            _walletService = walletService;
            Title = "Wallet Accounts";
        }

        [RelayCommand]
        private async Task LoadAccountsAsync()
        {
            await ExecuteSafeAsync(async () =>
            {
                await Task.Delay(500);
                Accounts.Clear();
                Accounts.Add(new WalletAccount { Name = "Main Account", Address = await _walletService.GetCurrentAddressAsync(), IsActive = true });
                // Load from storage later
            });
        }

        [RelayCommand]
        private async Task ShowAddAccountAsync()
        {
            await Shell.Current.GoToAsync("AddAccountPage");
        }
        
        [RelayCommand]
        private async Task SelectAccountAsync(WalletAccount account)
        {
            // Switch current operational account in wallet service
            await Task.Delay(200);
            foreach (var acc in Accounts) acc.IsActive = (acc == account);
        }
    }
}
