using ZXing.Net.Maui;

namespace KortanaWallet.Views.Common;

public partial class QrScannerPage : ContentPage
{
    private TaskCompletionSource<string?> _tcs = new();
    public Task<string?> ScannerResult => _tcs.Task;

	public QrScannerPage()
	{
		InitializeComponent();
        
        BarcodeReader.Options = new BarcodeReaderOptions
        {
            Formats = BarcodeFormats.TwoDimensional,
            AutoRotate = true,
            Multiple = false
        };
	}

    private void OnBarcodesDetected(object sender, BarcodeDetectionEventArgs e)
    {
        var result = e.Results.FirstOrDefault();
        if (result != null)
        {
            MainThread.BeginInvokeOnMainThread(async () => 
            {
                HapticFeedback.Default.Perform(HapticFeedbackType.Click);
                _tcs.TrySetResult(result.Value);
                await Navigation.PopModalAsync();
            });
        }
    }

    private async void OnCloseClicked(object sender, EventArgs e)
    {
        _tcs.TrySetResult(null);
        await Navigation.PopModalAsync();
    }
}
