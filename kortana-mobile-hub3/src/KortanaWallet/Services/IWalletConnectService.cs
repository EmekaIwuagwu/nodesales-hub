namespace KortanaWallet.Services
{
    public interface IWalletConnectService
    {
        Task ConnectWithUriAsync(string uri);
        Task ApproveSessionAsync(string topic);
        Task RejectSessionAsync(string topic);
        Task DisconnectSessionAsync(string topic);
        bool IsConnected { get; }
    }
}
