import CryptoJS from 'crypto-js';

class VaultService {
    /**
     * Encrypts a string using a password.
     */
    encrypt(data: string, password: string): string {
        return CryptoJS.AES.encrypt(data, password).toString();
    }

    /**
     * Decrypts a string using a password.
     */
    decrypt(encryptedData: string, password: string): string | null {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, password);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);
            if (!originalText) return null;
            return originalText;
        } catch (error) {
            console.error('Decryption failed:', error);
            return null;
        }
    }

    /**
     * Hashes a password for comparison (not for encryption).
     */
    hashPassword(password: string): string {
        return CryptoJS.SHA256(password).toString();
    }

    /**
     * Generates a random salt or IV if needed (CryptoJS handles salt internally by default).
     */
}

export const vaultService = new VaultService();
