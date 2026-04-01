namespace KortanaWallet.Views.Settings;

public partial class BackupPage : ContentPage
{
	public BackupPage(ViewModels.BackupViewModel vm)
	{
		InitializeComponent();
		BindingContext = vm;
	}
}
