using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using KortanaWallet.ViewModels.Base;
using KortanaWallet.Services;
using System.Threading.Tasks;
using System.IO;

namespace KortanaWallet.ViewModels
{
    public partial class ReceiveViewModel : BaseViewModel
    {
        private readonly IQrCodeService _qrCodeService;

        [ObservableProperty]
        private string _walletAddress;

        [ObservableProperty]
        private ImageSource? _qrCodeImageSource;

        public ReceiveViewModel(IQrCodeService qrCodeService)
        {
            _qrCodeService = qrCodeService;
            Title = "Receive";
            WalletAddress = "0x1234567890abcdef1234567890abcdef12345678";
            
            GenerateQrCode();
        }

        private void GenerateQrCode()
        {
            var qrBytes = _qrCodeService.GenerateQrCode(WalletAddress);
            QrCodeImageSource = ImageSource.FromStream(() => new MemoryStream(qrBytes));
        }

        [RelayCommand]
        public async Task CopyToClipboardAsync()
        {
            await Clipboard.Default.SetTextAsync(WalletAddress);
            // Show toast
        }

        [RelayCommand]
        public async Task ShareAsync()
        {
            await Share.Default.RequestAsync(new ShareTextRequest
            {
                Text = WalletAddress,
                Title = "My Wallet Address"
            });
        }
    }
}
