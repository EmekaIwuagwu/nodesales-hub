namespace KortanaWallet.Views.Network;

public partial class NetworkPage : ContentPage
{
	public NetworkPage(ViewModels.NetworkViewModel vm)
	{
		InitializeComponent();
		BindingContext = vm;
	}
}
