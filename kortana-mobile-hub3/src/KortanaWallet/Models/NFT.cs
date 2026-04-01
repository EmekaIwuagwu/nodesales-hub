using CommunityToolkit.Mvvm.ComponentModel;

namespace KortanaWallet.Models
{
    public partial class NFT : ObservableObject
    {
        [ObservableProperty]
        private string _name;

        [ObservableProperty]
        private string _collectionName;

        [ObservableProperty]
        private string _tokenId;

        [ObservableProperty]
        private string _imageUri;

        [ObservableProperty]
        private string _description;

        [ObservableProperty]
        private string _contractAddress;

        [ObservableProperty]
        private string _ownerAddress;
    }
}
