using KortanaWallet.Views.Auth;
using KortanaWallet.Views.Send;
using KortanaWallet.Views.Receive;
using KortanaWallet.Views.History;
using KortanaWallet.Views.Tokens;
using KortanaWallet.Views.Accounts;
using KortanaWallet.Views.Network;
using KortanaWallet.Views.Settings;
using KortanaWallet.Views.Browser;
using KortanaWallet.Views.NFTs;

namespace KortanaWallet
{
    public partial class AppShell : Shell
    {
        public AppShell()
        {
            InitializeComponent();

            // Register routes for pages not in the main TabBar
            Routing.RegisterRoute(nameof(CreateWalletPage), typeof(CreateWalletPage));
            Routing.RegisterRoute(nameof(ImportWalletPage), typeof(ImportWalletPage));
            Routing.RegisterRoute(nameof(SendPage), typeof(SendPage));
            Routing.RegisterRoute(nameof(ReceivePage), typeof(ReceivePage));
            Routing.RegisterRoute(nameof(TransactionDetailPage), typeof(TransactionDetailPage));
            Routing.RegisterRoute(nameof(AccountsPage), typeof(AccountsPage));
            Routing.RegisterRoute(nameof(NetworkPage), typeof(NetworkPage));
            Routing.RegisterRoute(nameof(BackupPage), typeof(BackupPage));
            Routing.RegisterRoute(nameof(DAppBrowserPage), typeof(DAppBrowserPage));
            Routing.RegisterRoute(nameof(NFTGalleryPage), typeof(NFTGalleryPage));
        }
    }
}
