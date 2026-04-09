import { Wallet } from '@rainbow-me/rainbowkit';
import { CreateConnectorFn } from 'wagmi';
import { injected } from 'wagmi/connectors';

export const kortanaWallet = (): Wallet => ({
  id: 'kortana-wallet',
  name: 'Kortana Wallet',
  iconUrl: 'https://raw.githubusercontent.com/kortana-xyz/assets/main/logo-v2.png',
  iconBackground: '#000',
  downloadUrls: {
    browserExtension: 'https://kortana.xyz',
    qrCode: 'https://kortana.xyz'
  },
  installed: true,
  createConnector: (walletDetails): CreateConnectorFn =>
    injected({
      target: () => ({
        id: 'kortana',
        name: 'Kortana Wallet',
        provider: typeof window !== 'undefined' ? ((window as any).kortana || (window as any).ethereum) : undefined,
      }),
      shimDisconnect: true,
    }),
});
