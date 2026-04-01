namespace KortanaWallet.Views.Send;

public partial class SendPage : ContentPage
{
	public SendPage(ViewModels.SendViewModel vm)
	{
		InitializeComponent();
		BindingContext = vm;
	}
}
