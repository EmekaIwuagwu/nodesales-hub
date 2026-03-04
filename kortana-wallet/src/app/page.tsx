'use client';

import { useWalletStore } from '@/store/useWalletStore';
import { Onboarding } from '@/components/Onboarding';
import { Dashboard } from '@/components/Dashboard';
import { SignRequest } from '@/components/views/SignRequest';
import { TransactionRequest } from '@/components/views/TransactionRequest';
import { useEffect, useState } from 'react';

export default function Home() {
  const { mnemonic, address, isLocked, _hasHydrated } = useWalletStore();
  const [pendingSignRequest, setPendingSignRequest] = useState(false);
  const [pendingTxRequest, setPendingTxRequest] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (typeof chrome !== 'undefined' && chrome.storage?.session) {
      chrome.storage.session.get('pendingSign', (data: any) => {
        if (data.pendingSign?.status === 'pending') setPendingSignRequest(true);
      });
      chrome.storage.session.get('pendingTransaction', (data: any) => {
        if (data.pendingTransaction?.status === 'pending') setPendingTxRequest(true);
      });
    }
  }, [_hasHydrated]);

  // Show spinner while async chromeStorage is being read
  if (!_hasHydrated) {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        background: '#0a0e27',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 32,
          height: 32,
          border: '2px solid rgba(6,182,212,0.2)',
          borderTop: '2px solid #06b6d4',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (pendingTxRequest) {
    return <TransactionRequest onDismiss={() => setPendingTxRequest(false)} />;
  }

  if (pendingSignRequest) {
    return <SignRequest onDismiss={() => setPendingSignRequest(false)} />;
  }

  return address && mnemonic && !isLocked
    ? <Dashboard />
    : <Onboarding />;
}
