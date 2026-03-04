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
  const [isExtension, setIsExtension] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Detect if running inside a Chrome Extension popup
    const isExt =
      typeof window !== 'undefined' &&
      (window.location.protocol === 'chrome-extension:' ||
        (typeof chrome !== 'undefined' && !!chrome.runtime?.id));

    if (isExt) {
      setIsExtension(true);
      // Force html element to extension dimensions so Chrome sizes the popup correctly
      document.documentElement.classList.add('is-extension');
      document.documentElement.style.width = '420px';
      document.documentElement.style.minWidth = '420px';
      document.body.style.width = '420px';
      document.body.style.minWidth = '420px';
    }

    if (typeof chrome !== 'undefined' && chrome.storage?.session) {
      // Check for pending signature request (personal_sign)
      chrome.storage.session.get('pendingSign', (data: any) => {
        if (data.pendingSign?.status === 'pending') {
          setPendingSignRequest(true);
        }
      });

      // Check for pending transaction request (eth_sendTransaction)
      chrome.storage.session.get('pendingTransaction', (data: any) => {
        if (data.pendingTransaction?.status === 'pending') {
          setPendingTxRequest(true);
        }
      });
    }
  }, []);

  if (!isClient) return null;

  // Transaction approval takes priority
  if (pendingTxRequest) {
    return (
      <main className={isExtension ? 'ext-root' : 'w-full min-h-screen'}>
        <TransactionRequest onDismiss={() => setPendingTxRequest(false)} />
      </main>
    );
  }

  // Sign request second
  if (pendingSignRequest) {
    return (
      <main className={isExtension ? 'ext-root' : 'w-full min-h-screen'}>
        <SignRequest onDismiss={() => setPendingSignRequest(false)} />
      </main>
    );
  }

  return (
    <main className={isExtension ? 'ext-root' : 'w-full min-h-screen'}>
      {address && mnemonic && !isLocked ? (
        <Dashboard />
      ) : (
        <Onboarding />
      )}
    </main>
  );
}
