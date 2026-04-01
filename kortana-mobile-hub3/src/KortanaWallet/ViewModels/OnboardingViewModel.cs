using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using KortanaWallet.ViewModels.Base;
using System.Collections.ObjectModel;

namespace KortanaWallet.ViewModels
{
    public class OnboardingSlide
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string ImageSource { get; set; }
    }

    public partial class OnboardingViewModel : BaseViewModel
    {
        public ObservableCollection<OnboardingSlide> Slides { get; } = new();

        public OnboardingViewModel()
        {
            Slides.Add(new OnboardingSlide 
            { 
                Title = "Secure & Decentralized", 
                Description = "Your keys, your crypto. The most secure way to manage your digital assets.",
                ImageSource = "ob_secure.png"
            });
            Slides.Add(new OnboardingSlide 
            { 
                Title = "Seamless Interactions", 
                Description = "Fast transactions and low fees on the native Kortana Network and Ethereum.",
                ImageSource = "ob_fast.png"
            });
            Slides.Add(new OnboardingSlide 
            { 
                Title = "DApp Explorer", 
                Description = "Access the entire ecosystem from your palm with our integrated browser.",
                ImageSource = "ob_explore.png"
            });
        }

        [RelayCommand]
        private async Task CreateWalletAsync()
        {
            await Shell.Current.GoToAsync("CreateWalletPage");
        }

        [RelayCommand]
        private async Task ImportWalletAsync()
        {
            await Shell.Current.GoToAsync("ImportWalletPage");
        }
    }
}
