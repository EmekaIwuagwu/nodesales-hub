using CommunityToolkit.Mvvm.ComponentModel;

namespace KortanaWallet.Models
{
    public partial class Token : ObservableObject
    {
        [ObservableProperty]
        private string _name;

        [ObservableProperty]
        private string _symbol;

        [ObservableProperty]
        private string _contractAddress;

        [ObservableProperty]
        private int _decimals;

        [ObservableProperty]
        private string _iconUri;

        [ObservableProperty]
        private double _balance;

        [ObservableProperty]
        private decimal _priceUsd;

        [ObservableProperty]
        private double _priceChange24h;

        public decimal TotalValueUsd => (decimal)Balance * PriceUsd;

        public bool IsNative => string.IsNullOrEmpty(ContractAddress) || ContractAddress == "0x0000000000000000000000000000000000000000";
    }
}
