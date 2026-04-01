using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;
using KortanaWallet.Models;
using KortanaWallet.ViewModels.Base;
using System.Threading.Tasks;
using System.Linq;

namespace KortanaWallet.ViewModels
{
    public partial class TransactionHistoryViewModel : BaseViewModel
    {
        public ObservableCollection<Transaction> Transactions { get; } = new();

        public TransactionHistoryViewModel()
        {
            Title = "Activity";
        }

        [RelayCommand]
        public async Task LoadHistoryAsync()
        {
            await ExecuteSafeAsync(async () =>
            {
                await Task.Delay(500);
                
                Transactions.Clear();
                Transactions.Add(new Transaction { 
                    Hash = "0x123...", 
                    Amount = 1.0, 
                    TokenSymbol = "KOR", 
                    Direction = TransactionDirection.Received, 
                    Status = TransactionStatus.Confirmed,
                    Timestamp = DateTime.Now.AddHours(-2)
                });
                
                Transactions.Add(new Transaction { 
                    Hash = "0x456...", 
                    Amount = 0.5, 
                    TokenSymbol = "KOR", 
                    Direction = TransactionDirection.Sent, 
                    Status = TransactionStatus.Confirmed,
                    Timestamp = DateTime.Now.AddDays(-1)
                });
            });
        }
    }
}
