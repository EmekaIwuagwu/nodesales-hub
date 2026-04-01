using Plugin.Fingerprint;
using Plugin.Fingerprint.Abstractions;

namespace KortanaWallet.Services
{
    public interface IBiometricService
    {
        Task<bool> IsAvailableAsync();
        Task<bool> AuthenticateAsync(string reason);
    }

    public class BiometricService : IBiometricService
    {
        public async Task<bool> IsAvailableAsync()
        {
            return await CrossFingerprint.Current.IsAvailableAsync();
        }

        public async Task<bool> AuthenticateAsync(string reason)
        {
            if (!await IsAvailableAsync()) return false;

            var request = new AuthenticationRequestConfiguration("Authenticate", reason)
            {
                AllowAlternativeAuthentication = true // Allow PIN if biometric fails
            };

            var result = await CrossFingerprint.Current.AuthenticateAsync(request);
            return result.Authenticated;
        }
    }
}
