import CryptoJS from 'crypto-js';
import 'react-native-get-random-values';

export const generateSalt = (size = 32) => {
    return CryptoJS.lib.WordArray.random(size).toString();
};

export const deriveKey = (password: string, salt: string, iterations = 100000) => {
    return CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: iterations,
        hasher: CryptoJS.algo.SHA256,
    }).toString();
};

export const encrypt = (text: string, key: string) => {
    return CryptoJS.AES.encrypt(text, key).toString();
};

export const decrypt = (ciphertext: string, key: string) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8);
};
