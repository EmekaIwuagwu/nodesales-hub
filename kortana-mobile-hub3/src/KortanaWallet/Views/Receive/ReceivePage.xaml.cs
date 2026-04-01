namespace KortanaWallet.Views.Receive;

public partial class ReceivePage : ContentPage
{
	public ReceivePage(ViewModels.ReceiveViewModel vm)
	{
		InitializeComponent();
		BindingContext = vm;
	}
}
