using CommunityToolkit.Mvvm.ComponentModel;

namespace KortanaWallet.Models
{
    public partial class Network : ObservableObject
    {
        [ObservableProperty]
        private string _name;

        [ObservableProperty]
        private string _rpcUrl;

        [ObservableProperty]
        private int _chainId;

        [ObservableProperty]
        private string _symbol;

        [ObservableProperty]
        private string _explorerUrl;

        [ObservableProperty]
        private string _iconUri;

        [ObservableProperty]
        private bool _isTestnet;

        [ObservableProperty]
        private bool _isActive;
    }
}
