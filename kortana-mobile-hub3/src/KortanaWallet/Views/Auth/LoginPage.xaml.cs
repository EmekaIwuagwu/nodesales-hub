namespace KortanaWallet.Views.Auth;

public partial class LoginPage : ContentPage
{
	public LoginPage(ViewModels.LoginViewModel vm)
	{
		InitializeComponent();
		BindingContext = vm;
	}
}
