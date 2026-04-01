using CommunityToolkit.Mvvm.ComponentModel;
using KortanaWallet.Models;
using System.Collections.ObjectModel;
using KortanaWallet.ViewModels.Base;

namespace KortanaWallet.ViewModels
{
    public partial class NFTViewModel : BaseViewModel
    {
        [ObservableProperty]
        private ObservableCollection<NFT> _nFTs = new();

        public NFTViewModel()
        {
            Title = "NFTS";
            LoadTestNFTs();
        }

        private void LoadTestNFTs()
        {
            NFTs.Add(new NFT { Name = "Kortana Genesis #001", CollectionName = "Kortana Genesis", ImageUri = "https://example.com/nft1.jpg" });
            NFTs.Add(new NFT { Name = "Deep Blue Void", CollectionName = "Void Series", ImageUri = "https://example.com/nft2.jpg" });
            NFTs.Add(new NFT { Name = "Neon Heart", CollectionName = "Heart of Machine", ImageUri = "https://example.com/nft3.jpg" });
        }
    }
}
