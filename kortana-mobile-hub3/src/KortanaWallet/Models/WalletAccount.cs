using CommunityToolkit.Mvvm.ComponentModel;

namespace KortanaWallet.Models
{
    public partial class WalletAccount : ObservableObject
    {
        [ObservableProperty]
        private string _name;

        [ObservableProperty]
        private string _address;

        [ObservableProperty]
        private string _identiconUri;

        [ObservableProperty]
        private decimal _portfolioBalanceUsd;

        [ObservableProperty]
        private bool _isActive;

        public string TruncatedAddress => 
            string.IsNullOrEmpty(Address) ? string.Empty : 
            $"{Address.Substring(0, 6)}...{Address.Substring(Address.Length - 4)}";
    }
}
