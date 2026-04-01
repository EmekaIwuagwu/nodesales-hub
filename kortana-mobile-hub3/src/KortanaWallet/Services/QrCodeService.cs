using QRCoder;
using Microsoft.Maui.Graphics;

namespace KortanaWallet.Services
{
    public interface IQrCodeService
    {
        byte[] GenerateQrCode(string content, string darkColorHex = "#1A3BB0", string lightColorHex = "#FFFFFF");
        Task<string?> ScanAsync();
    }

    public class QrCodeService : IQrCodeService
    {
        public byte[] GenerateQrCode(string content, string darkColorHex = "#1A3BB0", string lightColorHex = "#FFFFFF")
        {
            using (var qrGenerator = new QRCodeGenerator())
            {
                using (var qrCodeData = qrGenerator.CreateQrCode(content, QRCodeGenerator.ECCLevel.Q))
                {
                    using (PngByteQRCode qrCode = new PngByteQRCode(qrCodeData))
                    {
                        return qrCode.GetGraphic(20);
                    }
                }
            }
        }

        public async Task<string?> ScanAsync()
        {
            var scannerPage = new Views.Common.QrScannerPage();
            await Shell.Current.Navigation.PushModalAsync(scannerPage);
            return await scannerPage.ScannerResult;
        }
    }
}
