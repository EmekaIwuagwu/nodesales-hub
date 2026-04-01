using KortanaWallet.Services;

namespace KortanaWallet.Views.Splash
{
    public partial class SplashPage : ContentPage
    {
        private readonly IStorageService _storageService;

        public SplashPage(IStorageService storageService)
        {
            InitializeComponent();
            _storageService = storageService;
        }

        protected override async void OnAppearing()
        {
            base.OnAppearing();

            // Initial scale animation for logo
            LogoImage.Scale = 0.5;
            LogoImage.Opacity = 0;
            
            await Task.WhenAll(
                LogoImage.ScaleTo(1.0, 500, Easing.SpringOut),
                LogoImage.FadeTo(1.0, 400)
            );

            // Pulse animation loop for the glow
            _ = PulseAnimation();

            // Fade in tagline
            await Task.Delay(400);
            await TaglineLabel.FadeTo(1.0, 600);

            // Wait for specified splash duration (2.5s total approx)
            await Task.Delay(1000);

            // Decide navigation path
            // Check if a wallet has been already configured
            bool hasWallet = await _storageService.HasKeyAsync("encrypted_mnemonic");
            
            if (hasWallet)
            {
                await Shell.Current.GoToAsync("//Login");
            }
            else
            {
                await Shell.Current.GoToAsync("//Onboarding");
            }
        }

        private async Task PulseAnimation()
        {
            while (true)
            {
                await PulseGlow.ScaleTo(1.4, 1000, Easing.SinInOut);
                await PulseGlow.ScaleTo(1.0, 1000, Easing.SinInOut);
            }
        }
    }
}
