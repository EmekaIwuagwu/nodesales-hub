using CommunityToolkit.Mvvm.ComponentModel;
using KortanaWallet.Models;
using System.Collections.ObjectModel;

namespace KortanaWallet.Services
{
    public interface INetworkService
    {
        ObservableCollection<Network> AvailableNetworks { get; }
        Network SelectedNetwork { get; set; }
        event EventHandler<Network> NetworkChanged;
    }

    public class NetworkService : ObservableObject, INetworkService
    {
        private Network _selectedNetwork;
        public ObservableCollection<Network> AvailableNetworks { get; }

        public event EventHandler<Network> NetworkChanged;

        public Network SelectedNetwork
        {
            get => _selectedNetwork;
            set
            {
                if (SetProperty(ref _selectedNetwork, value))
                {
                    NetworkChanged?.Invoke(this, value);
                }
            }
        }

        public NetworkService()
        {
            AvailableNetworks = new ObservableCollection<Network>
            {
                new Network 
                { 
                    Name = "Kortana Mainnet", 
                    RpcUrl = "https://rpc.kortana.network", 
                    ChainId = 1337, // Placeholder ChainID for Kortana
                    Symbol = "KOR",
                    ExplorerUrl = "https://explorer.kortana.network",
                    IsTestnet = false
                },
                new Network 
                { 
                    Name = "Ethereum Mainnet", 
                    RpcUrl = "https://mainnet.infura.io/v3/YOUR_INFURA_KEY", 
                    ChainId = 1, 
                    Symbol = "ETH",
                    ExplorerUrl = "https://etherscan.io",
                    IsTestnet = false
                },
                new Network 
                { 
                    Name = "Sepolia Testnet", 
                    RpcUrl = "https://sepolia.infura.io/v3/YOUR_INFURA_KEY", 
                    ChainId = 11155111, 
                    Symbol = "ETH",
                    ExplorerUrl = "https://sepolia.etherscan.io",
                    IsTestnet = true
                }
            };

            SelectedNetwork = AvailableNetworks[0];
        }
    }
}
