using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using KortanaWallet.Models;
using KortanaWallet.ViewModels.Base;
using System.Threading.Tasks;

namespace KortanaWallet.ViewModels
{
    [QueryProperty(nameof(Transaction), "Transaction")]
    public partial class TransactionDetailViewModel : BaseViewModel
    {
        [ObservableProperty]
        private Transaction _transaction;

        public TransactionDetailViewModel()
        {
            Title = "Transaction Details";
        }

        [RelayCommand]
        private async Task ViewOnExplorerAsync()
        {
            if (Transaction == null) return;
            
            string url = $"https://explorer.kortana.network/tx/{Transaction.Hash}";
            await Browser.Default.OpenAsync(url, BrowserLaunchMode.SystemPreferred);
        }

        [RelayCommand]
        private async Task CopyHashAsync()
        {
            if (Transaction == null) return;
            await Clipboard.Default.SetTextAsync(Transaction.Hash);
            // Toast would show here
        }
    }
}
