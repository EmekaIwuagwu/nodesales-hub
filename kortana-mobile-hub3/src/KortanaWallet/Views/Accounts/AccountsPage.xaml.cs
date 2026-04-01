namespace KortanaWallet.Views.Accounts;

public partial class AccountsPage : ContentPage
{
	public AccountsPage(ViewModels.AccountsViewModel vm)
	{
		InitializeComponent();
		BindingContext = vm;
	}
}
