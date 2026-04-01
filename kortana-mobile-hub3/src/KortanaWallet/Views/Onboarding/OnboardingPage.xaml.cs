using KortanaWallet.ViewModels;

namespace KortanaWallet.Views.Onboarding
{
    public partial class OnboardingPage : ContentPage
    {
        public OnboardingPage(OnboardingViewModel vm)
        {
            InitializeComponent();
            BindingContext = vm;
        }
    }
}
