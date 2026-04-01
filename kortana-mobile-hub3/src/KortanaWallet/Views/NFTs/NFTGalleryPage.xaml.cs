namespace KortanaWallet.Views.NFTs;

public partial class NFTGalleryPage : ContentPage
{
	public NFTGalleryPage(ViewModels.NFTViewModel vm)
	{
		InitializeComponent();
		BindingContext = vm;
	}
}
