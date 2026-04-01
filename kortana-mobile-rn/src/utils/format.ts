// src/utils/format.ts
import { ethers } from 'ethers';

export const formatAddress = (address: string, digits = 4): string => {
  if (!address) return '';
  return `${address.substring(0, digits + 2)}...${address.substring(
    address.length - digits
  )}`;
};

export const formatCurrency = (value: number | string, decimals = 2): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatEther = (wei: bigint | string): string => {
  return ethers.formatEther(wei);
};

export const parseEther = (ether: string): bigint => {
  return ethers.parseEther(ether);
};
