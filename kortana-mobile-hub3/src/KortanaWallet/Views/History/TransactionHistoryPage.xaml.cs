namespace KortanaWallet.Views.History;

public partial class TransactionHistoryPage : ContentPage
{
	public TransactionHistoryPage(ViewModels.TransactionHistoryViewModel vm)
	{
		InitializeComponent();
		BindingContext = vm;
	}
}
