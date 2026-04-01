namespace KortanaWallet.Services
{
    public class WalletConnectService : IWalletConnectService
    {
        public bool IsConnected => false;

        public async Task ConnectWithUriAsync(string uri)
        {
            // Simulate connection
            await Task.Delay(1000);
        }

        public async Task ApproveSessionAsync(string topic)
        {
             await Task.Delay(500);
        }

        public async Task RejectSessionAsync(string topic)
        {
             await Task.Delay(500);
        }

        public async Task DisconnectSessionAsync(string topic)
        {
             await Task.Delay(500);
        }
    }
}
