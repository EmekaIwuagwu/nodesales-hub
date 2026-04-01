namespace KortanaWallet.Views.Swap;

public partial class SwapPage : ContentPage
{
	public SwapPage(ViewModels.SwapViewModel vm)
	{
		InitializeComponent();
		BindingContext = vm;
	}
}
