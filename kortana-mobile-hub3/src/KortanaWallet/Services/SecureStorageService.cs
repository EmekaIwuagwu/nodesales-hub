using System.Security.Cryptography;
using System.Text;
using KortanaWallet.Core.Constants;

namespace KortanaWallet.Services
{
    public class SecureStorageService : IStorageService
    {
        public async Task<bool> HasKeyAsync(string key)
        {
            var value = await SecureStorage.Default.GetAsync(key);
            return !string.IsNullOrEmpty(value);
        }

        public async Task<string> GetAsync(string key)
        {
            return await SecureStorage.Default.GetAsync(key);
        }

        public async Task SetAsync(string key, string value)
        {
            await SecureStorage.Default.SetAsync(key, value);
        }

        public async Task RemoveAsync(string key)
        {
            SecureStorage.Default.Remove(key);
        }

        public async Task ClearAllAsync()
        {
            SecureStorage.Default.RemoveAll();
        }

        public async Task SaveEncryptedMnemonicAsync(string mnemonic, string password)
        {
            // 1. Generate a salt
            byte[] salt = new byte[16];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }

            // 2. Derive key using PBKDF2
            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 100000, HashAlgorithmName.SHA256);
            byte[] key = pbkdf2.GetBytes(32); // AES-256
            byte[] iv = pbkdf2.GetBytes(16);

            // 3. Encrypt mnemonic
            byte[] encrypted;
            using (var aes = Aes.Create())
            {
                aes.Key = key;
                aes.IV = iv;
                using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
                byte[] plainBytes = Encoding.UTF8.GetBytes(mnemonic);
                encrypted = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);
            }

            // 4. Store encrypted data and salt
            await SetAsync(AppConstants.EncryptedMnemonicKey, Convert.ToBase64String(encrypted));
            await SetAsync(AppConstants.KeySaltKey, Convert.ToBase64String(salt));
        }

        public async Task<string> RecoverMnemonicAsync(string password)
        {
            string encryptedBase64 = await GetAsync(AppConstants.EncryptedMnemonicKey);
            string saltBase64 = await GetAsync(AppConstants.KeySaltKey);

            if (string.IsNullOrEmpty(encryptedBase64) || string.IsNullOrEmpty(saltBase64))
                return null;

            byte[] encrypted = Convert.FromBase64String(encryptedBase64);
            byte[] salt = Convert.FromBase64String(saltBase64);

            // 1. Re-derive key
            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 100000, HashAlgorithmName.SHA256);
            byte[] key = pbkdf2.GetBytes(32);
            byte[] iv = pbkdf2.GetBytes(16);

            // 2. Decrypt
            try
            {
                using var aes = Aes.Create();
                aes.Key = key;
                aes.IV = iv;
                using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
                byte[] plainBytes = decryptor.TransformFinalBlock(encrypted, 0, encrypted.Length);
                return Encoding.UTF8.GetString(plainBytes);
            }
            catch
            {
                return null; // Decryption failed (wrong password)
            }
        }

        public async Task SavePinHashAsync(string pin)
        {
            using var sha256 = SHA256.Create();
            byte[] hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(pin));
            await SetAsync(AppConstants.PinHashKey, Convert.ToBase64String(hash));
        }

        public async Task<bool> ValidatePinAsync(string pin)
        {
            string storedHash = await GetAsync(AppConstants.PinHashKey);
            if (string.IsNullOrEmpty(storedHash)) return false;

            using var sha256 = SHA256.Create();
            byte[] currentHashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(pin));
            string currentHash = Convert.ToBase64String(currentHashBytes);

            return storedHash == currentHash;
        }
    }
}
