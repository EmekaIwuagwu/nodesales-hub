// src/services/keychain.service.ts
import * as Keychain from 'react-native-keychain';
import EncryptedStorage from 'react-native-encrypted-storage';

const MNEMONIC_KEY = 'KORTANA_WALLET_MNEMONIC';

export class KeychainService {
  static async setMnemonic(mnemonic: string) {
    try {
      await Keychain.setGenericPassword(MNEMONIC_KEY, mnemonic, {
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
        accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
        securityLevel: Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
      });
    } catch (error) {
      console.error('Failed to store mnemonic in keychain:', error);
      // Fallback to encrypted storage if keychain fails (less secure but works as last resort)
      await EncryptedStorage.setItem(MNEMONIC_KEY, mnemonic);
    }
  }

  static async getMnemonic(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        return credentials.password;
      }
      return await EncryptedStorage.getItem(MNEMONIC_KEY);
    } catch (error) {
      console.error('Failed to retrieve mnemonic from keychain:', error);
      return await EncryptedStorage.getItem(MNEMONIC_KEY);
    }
  }

  static async clearMnemonic() {
    try {
      await Keychain.resetGenericPassword();
      await EncryptedStorage.removeItem(MNEMONIC_KEY);
    } catch (error) {
      console.error('Failed to clear mnemonic:', error);
    }
  }
}
