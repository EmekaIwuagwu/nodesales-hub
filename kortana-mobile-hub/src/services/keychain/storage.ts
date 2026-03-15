import * as Keychain from 'react-native-keychain';
import EncryptedStorage from 'react-native-encrypted-storage';

const MNEMONIC_KEY = 'wallet_encrypted_mnemonic';
const SALT_KEY = 'wallet_salt';

export const saveEncryptedMnemonic = async (encryptedMnemonic: string, salt: string) => {
    try {
        await EncryptedStorage.setItem(MNEMONIC_KEY, encryptedMnemonic);
        await EncryptedStorage.setItem(SALT_KEY, salt);
    } catch (error) {
        console.error('Error saving encrypted mnemonic:', error);
        throw error;
    }
};

export const getEncryptedMnemonic = async () => {
    try {
        const ciphertext = await EncryptedStorage.getItem(MNEMONIC_KEY);
        const salt = await EncryptedStorage.getItem(SALT_KEY);
        if (!ciphertext || !salt) return null;
        return { ciphertext, salt };
    } catch (error) {
        console.error('Error getting encrypted mnemonic:', error);
        return null;
    }
};

export const clearWalletData = async () => {
    try {
        await EncryptedStorage.removeItem(MNEMONIC_KEY);
        await EncryptedStorage.removeItem(SALT_KEY);
        await Keychain.resetGenericPassword();
    } catch (error) {
        console.error('Error clearing wallet data:', error);
    }
};
