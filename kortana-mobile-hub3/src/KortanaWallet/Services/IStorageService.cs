using System.Threading.Tasks;

namespace KortanaWallet.Services
{
    public interface IStorageService
    {
        Task<bool> HasKeyAsync(string key);
        Task<string> GetAsync(string key);
        Task SetAsync(string key, string value);
        Task RemoveAsync(string key);
        Task ClearAllAsync();
        
        // Secure high-level methods
        Task SaveEncryptedMnemonicAsync(string mnemonic, string password);
        Task<string> RecoverMnemonicAsync(string password);
        Task SavePinHashAsync(string pin);
        Task<bool> ValidatePinAsync(string pin);
    }
}
