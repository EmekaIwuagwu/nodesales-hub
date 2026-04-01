using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using KortanaWallet.Models;
using KortanaWallet.ViewModels.Base;
using KortanaWallet.Services;
using System.Collections.ObjectModel;
using System.Threading.Tasks;

namespace KortanaWallet.ViewModels
{
    public partial class NetworkViewModel : BaseViewModel
    {
        public ObservableCollection<Network> Networks { get; } = new();

        public NetworkViewModel()
        {
            Title = "Networks";
            
            // Default Networks
            Networks.Add(new Network { Name = "Kortana Mainnet", ChainId = 2024, Symbol = "KOR", IsActive = true, IsTestnet = false });
            Networks.Add(new Network { Name = "Kortana Testnet", ChainId = 2025, Symbol = "tKOR", IsActive = false, IsTestnet = true });
            Networks.Add(new Network { Name = "Ethereum Mainnet", ChainId = 1, Symbol = "ETH", IsActive = false, IsTestnet = false });
        }

        [RelayCommand]
        private async Task SwitchNetworkAsync(Network network)
        {
            await ExecuteSafeAsync(async () =>
            {
                await Task.Delay(200);
                foreach (var n in Networks) n.IsActive = (n == network);
                // Update global WalletService RPC here
            });
        }
    }
}
