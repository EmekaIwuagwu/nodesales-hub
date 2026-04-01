namespace KortanaWallet.Views.Browser;

public partial class DAppBrowserPage : ContentPage
{
	public DAppBrowserPage()
	{
		InitializeComponent();
	}

    private void OnUrlEntered(object sender, EventArgs e)
    {
        LoadUrl();
    }

    private void OnGoClicked(object sender, EventArgs e)
    {
        LoadUrl();
    }

    private void LoadUrl()
    {
        string url = UrlEntry.Text;
        if (string.IsNullOrWhiteSpace(url)) return;

        if (!url.StartsWith("http"))
        {
            url = "https://" + url;
        }

        LoadingIndicator.IsRunning = true;
        MainWebView.Source = url;
    }

    private void OnNavigated(object sender, WebNavigatedEventArgs e)
    {
        LoadingIndicator.IsRunning = false;
        UrlEntry.Text = e.Url;
    }
}
