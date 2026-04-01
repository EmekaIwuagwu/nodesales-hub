namespace KortanaWallet.Views.Dashboard;

public partial class DashboardPage : ContentPage
{
	public DashboardPage(ViewModels.DashboardViewModel vm)
	{
		InitializeComponent();
		BindingContext = vm;
	}

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        if (BindingContext is ViewModels.DashboardViewModel vm)
        {
            await vm.RefreshAsync();
        }
    }
}
