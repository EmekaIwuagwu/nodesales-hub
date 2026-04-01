namespace KortanaWallet.Core.Constants
{
    public static class AppConstants
    {
        public const string AppName = "Kortana Wallet";
        
        // Kortana Network - Mainnet
        public const string KortanaMainnetName = "Kortana Mainnet";
        public const string KortanaMainnetRpcUrl = "https://rpc.kortana.network";
        public const int KortanaMainnetChainId = 2024;
        public const string KortanaMainnetSymbol = "KOR";
        public const string KortanaMainnetExplorer = "https://explorer.kortana.network";

        // Kortana Network - Testnet
        public const string KortanaTestnetName = "Kortana Testnet";
        public const string KortanaTestnetRpcUrl = "https://testnet-rpc.kortana.network";
        public const int KortanaTestnetChainId = 2025;
        public const string KortanaTestnetSymbol = "tKOR";
        public const string KortanaTestnetExplorer = "https://testnet-explorer.kortana.network";

        // Wallet Derivation Path
        public const string StandardDerivationPath = "m/44'/60'/0'/0/0";

        // Storage Keys
        public const string EncryptedMnemonicKey = "encrypted_mnemonic";
        public const string KeySaltKey = "key_salt";
        public const string PinHashKey = "pin_hash";
        public const string IsBiometricEnabledKey = "is_biometric_enabled";
    }
}
