namespace KortanaWallet.Views.Auth;

public partial class ImportWalletPage : ContentPage
{
	public ImportWalletPage(ViewModels.ImportWalletViewModel vm)
	{
		InitializeComponent();
		BindingContext = vm;
	}
}
