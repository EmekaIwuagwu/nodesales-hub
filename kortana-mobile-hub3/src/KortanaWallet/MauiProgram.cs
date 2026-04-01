using CommunityToolkit.Maui;
using KortanaWallet.Services;
using KortanaWallet.ViewModels;
using Microsoft.Extensions.Logging;
using SkiaSharp.Views.Maui.Controls.Hosting;
using ZXing.Net.Maui.Controls;
using Mopups.Hosting;

namespace KortanaWallet
{
    public static class MauiProgram
    {
        public static MauiApp CreateMauiApp()
        {
            var builder = MauiApp.CreateBuilder();
            builder
                .UseMauiApp<App>()
                .UseMauiCommunityToolkit()
                .UseSkiaSharp()
                .ConfigureMopups()
                .UseBarcodeReader()
                .ConfigureFonts(fonts =>
                {
                    fonts.AddFont("Inter-Regular.ttf", "InterRegular");
                    fonts.AddFont("Inter-SemiBold.ttf", "InterSemiBold");
                    fonts.AddFont("Inter-Bold.ttf", "InterBold");
                    fonts.AddFont("SpaceMono-Regular.ttf", "Mono");
                });

#if DEBUG
    		builder.Logging.AddDebug();
#endif
            
            // Register Services
            builder.Services.AddSingleton<IStorageService, SecureStorageService>();
            builder.Services.AddSingleton<IWalletService, WalletService>();
            builder.Services.AddSingleton<IBiometricService, BiometricService>();
            builder.Services.AddSingleton<ITokenService, TokenService>();
            builder.Services.AddSingleton<IPriceService, PriceService>();
            builder.Services.AddSingleton<ITransactionService, TransactionService>();
            builder.Services.AddSingleton<IQrCodeService, QrCodeService>();
            builder.Services.AddSingleton<IWalletConnectService, WalletConnectService>();
            builder.Services.AddSingleton<INetworkService, NetworkService>();
            
            // Register ViewModels
            builder.Services.AddTransient<DashboardViewModel>();
            builder.Services.AddTransient<SendViewModel>();
            builder.Services.AddTransient<ReceiveViewModel>();
            builder.Services.AddTransient<TransactionHistoryViewModel>();
            builder.Services.AddTransient<TransactionDetailViewModel>();
            builder.Services.AddTransient<CreateWalletViewModel>();
            builder.Services.AddTransient<ImportWalletViewModel>();
            builder.Services.AddTransient<LoginViewModel>();
            builder.Services.AddTransient<TokenListViewModel>();
            builder.Services.AddTransient<AccountsViewModel>();
            builder.Services.AddTransient<SettingsViewModel>();
            builder.Services.AddTransient<NetworkViewModel>();
            builder.Services.AddTransient<BackupViewModel>();
            builder.Services.AddTransient<SwapViewModel>();
            builder.Services.AddTransient<NFTViewModel>();
            builder.Services.AddTransient<OnboardingViewModel>();
            
            // Register Pages
            builder.Services.AddTransient<Views.Dashboard.DashboardPage>();
            builder.Services.AddTransient<Views.Send.SendPage>();
            builder.Services.AddTransient<Views.Receive.ReceivePage>();
            builder.Services.AddTransient<Views.History.TransactionHistoryPage>();
            builder.Services.AddTransient<Views.History.TransactionDetailPage>();
            builder.Services.AddTransient<Views.Auth.CreateWalletPage>();
            builder.Services.AddTransient<Views.Auth.ImportWalletPage>();
            builder.Services.AddTransient<Views.Auth.LoginPage>();
            builder.Services.AddTransient<Views.Tokens.TokenListPage>();
            builder.Services.AddTransient<Views.Accounts.AccountsPage>();
            builder.Services.AddTransient<Views.Settings.SettingsPage>();
            builder.Services.AddTransient<Views.Network.NetworkPage>();
            builder.Services.AddTransient<Views.Settings.BackupPage>();
            builder.Services.AddTransient<Views.Swap.SwapPage>();
            builder.Services.AddTransient<Views.Browser.DAppBrowserPage>();
            builder.Services.AddTransient<Views.NFTs.NFTGalleryPage>();
            builder.Services.AddTransient<Views.Onboarding.OnboardingPage>();
            builder.Services.AddTransient<Views.Splash.SplashPage>();

            return builder.Build();
        }
    }
}
