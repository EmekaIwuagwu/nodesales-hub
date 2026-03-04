'use client';

import { useWalletStore } from '@/store/useWalletStore';
import { Onboarding } from '@/components/Onboarding';
import { Dashboard } from '@/components/Dashboard';
import { SignRequest } from '@/components/views/SignRequest';
import { TransactionRequest } from '@/components/views/TransactionRequest';
import { useEffect, useState } from 'react';

export default function Home() {
  const { mnemonic, address, isLocked } = useWalletStore();
  const [isClient, setIsClient] = useState(false);
  const [pendingSignRequest, setPendingSignRequest] = useState(false);
  const [pendingTxRequest, setPendingTxRequest] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (typeof chrome !== 'undefined' && chrome.storage?.session) {
      chrome.storage.session.get('pendingSign', (data: any) => {
        if (data.pendingSign?.status === 'pending') setPendingSignRequest(true);
      });
      chrome.storage.session.get('pendingTransaction', (data: any) => {
        if (data.pendingTransaction?.status === 'pending') setPendingTxRequest(true);
      });
    }
  }, []);

  // Avoid hydration mismatch — show loading state instead of null
  if (!isClient) {
    return (
      <div className="w-full h-screen bg-deep-space flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (pendingTxRequest) {
    return <TransactionRequest onDismiss={() => setPendingTxRequest(false)} />;
  }

  if (pendingSignRequest) {
    return <SignRequest onDismiss={() => setPendingSignRequest(false)} />;
  }

  return address && mnemonic && !isLocked ? <Dashboard /> : <Onboarding />;
}
