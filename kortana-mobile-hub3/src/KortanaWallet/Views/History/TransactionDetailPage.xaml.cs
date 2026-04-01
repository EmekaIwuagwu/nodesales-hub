namespace KortanaWallet.Views.History;

public partial class TransactionDetailPage : ContentPage
{
	public TransactionDetailPage(ViewModels.TransactionDetailViewModel vm)
	{
		InitializeComponent();
		BindingContext = vm;
	}
}
