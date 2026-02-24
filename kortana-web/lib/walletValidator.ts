import { isAddress } from 'ethers';

export const validateWalletAddress = (address: string): boolean => {
    return isAddress(address);
};
