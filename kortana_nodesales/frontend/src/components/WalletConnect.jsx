import { useWallet } from "../hooks/useWallet";

export default function WalletConnect({ compact = false }) {
  const { walletAddress, isConnected, connect, disconnect } = useWallet();

  if (isConnected && walletAddress) {
    return (
      <button onClick={disconnect} className="btn-outline text-sm py-2 px-4">
        {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
      </button>
    );
  }

  return (
    <button
      onClick={connect}
      className={compact ? "btn-primary text-sm py-2 px-4" : "btn-primary"}
    >
      Connect Wallet
    </button>
  );
}
