import { HDNodeWallet, Mnemonic, Wallet } from 'ethers';
import * as bip39 from 'bip39';
import 'react-native-get-random-values';

const DERIVATION_PATH = (accountIndex: number) => `m/44'/60'/${accountIndex}'/0/0`;

export const generateMnemonic = () => {
    return bip39.generateMnemonic();
};

export const validateMnemonic = (mnemonic: string) => {
    return bip39.validateMnemonic(mnemonic);
};

export const createWalletFromMnemonic = (phrase: string, accountIndex = 0) => {
    if (!validateMnemonic(phrase)) {
        throw new Error('Invalid mnemonic');
    }
    const mnemonic = Mnemonic.fromPhrase(phrase);
    const root = HDNodeWallet.fromMnemonic(mnemonic);
    const child = root.derivePath(DERIVATION_PATH(accountIndex));

    return {
        address: child.address,
        privateKey: child.privateKey,
        publicKey: child.publicKey,
        path: child.path,
    };
};

export const getWalletFromPrivateKey = (privateKey: string) => {
    return new Wallet(privateKey);
};
