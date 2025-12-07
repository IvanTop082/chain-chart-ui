'use client';

import React, { useEffect, useState } from 'react';
import { WalletProvider } from '@rentfuse-labs/neo-wallet-adapter-react';
import { WalletModalProvider } from '@rentfuse-labs/neo-wallet-adapter-ant-design';
import { getNeoLineWallet, Wallet } from '@rentfuse-labs/neo-wallet-adapter-wallets';

// Import styles
import '@rentfuse-labs/neo-wallet-adapter-ant-design/styles.css';

// Get available wallets (NeoLine for now, can add more)
function getWallets(): Wallet[] {
  return [
    getNeoLineWallet(),
    // Add other wallets if needed: getO3Wallet(), etc.
  ];
}

export function ChainChartWalletProvider({ children }: { children: React.ReactNode }) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  
  useEffect(() => {
    try {
      const walletList = getWallets();
      setWallets(walletList);
    } catch (error) {
      console.error('Error initializing wallets:', error);
      setWallets([]);
    }
  }, []);

  return (
    <WalletProvider wallets={wallets} autoConnect={true}>
      <WalletModalProvider centered={false}>
        {children}
      </WalletModalProvider>
    </WalletProvider>
  );
}



