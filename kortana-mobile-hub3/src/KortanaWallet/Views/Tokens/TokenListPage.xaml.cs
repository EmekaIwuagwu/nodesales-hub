namespace KortanaWallet.Views.Tokens;

public partial class TokenListPage : ContentPage
{
	public TokenListPage(ViewModels.TokenListViewModel vm)
	{
		InitializeComponent();
		BindingContext = vm;
	}
}
