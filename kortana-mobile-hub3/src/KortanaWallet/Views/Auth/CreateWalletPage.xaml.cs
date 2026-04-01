namespace KortanaWallet.Views.Auth;

public partial class CreateWalletPage : ContentPage
{
	public CreateWalletPage(ViewModels.CreateWalletViewModel vm)
	{
		InitializeComponent();
		BindingContext = vm;
	}
}
