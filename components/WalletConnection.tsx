'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Check } from 'lucide-react';
import { isNeoLineInstalled, connectNeoLine } from '@/lib/neoline';
import { toast } from 'sonner';

interface WalletConnectionProps {
  onConnected?: (address: string) => void;
  onDisconnected?: () => void;
}

export default function WalletConnection({ onConnected, onDisconnected }: WalletConnectionProps) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    // Wait a bit for NeoLine to inject, then check
    const timer = setTimeout(async () => {
      // Re-check if NeoLine is available (might have loaded since page load)
      const available = isNeoLineInstalled();
      setIsInstalled(available);
      
      // Try to get existing connection
      if (available) {
        checkConnection();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const checkConnection = async () => {
    try {
      // Try to get account - if it works, we're connected
      const account = await connectNeoLine();
      if (account && account.address) {
        setAddress(account.address);
        setIsConnected(true);
        onConnected?.(account.address);
      }
    } catch (error) {
      // Not connected - this is normal if wallet isn't connected yet
      setIsConnected(false);
      setAddress(null);
    }
  };

  const handleConnect = async () => {
    // Re-check if NeoLine is available (might have loaded since page load)
    const available = isNeoLineInstalled();
    setIsInstalled(available);
    
    if (!available) {
      toast.error(
        'NeoLine wallet is not detected',
        {
          description: 'Please install NeoLine N3 extension from neoline.io and refresh the page',
          action: {
            label: 'Install',
            onClick: () => window.open('https://neoline.io/', '_blank'),
          },
        }
      );
      return;
    }

    setConnecting(true);
    try {
      const account = await connectNeoLine();
      setAddress(account.address);
      setIsConnected(true);
      onConnected?.(account.address);
      
      toast.success('Wallet connected!', {
        description: `Connected to ${account.address.slice(0, 8)}...${account.address.slice(-6)}`,
      });
    } catch (error: any) {
      const errorMsg = error.message || 'Please make sure NeoLine is unlocked';
      
      // Provide helpful error message
      if (errorMsg.includes('not installed') || errorMsg.includes('not detected')) {
        toast.error('NeoLine not detected', {
          description: 'Make sure:\n1. NeoLine N3 extension is installed\n2. Extension is enabled\n3. Refresh the page',
        });
      } else {
        toast.error('Failed to connect wallet', {
          description: errorMsg,
        });
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setAddress(null);
    setIsConnected(false);
    onDisconnected?.();
    
    toast.info('Wallet disconnected');
  };

  if (!isInstalled) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open('https://neoline.io/', '_blank')}
        className="gap-2"
      >
        <Wallet className="w-4 h-4" />
        Install NeoLine
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
          <Check className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-mono text-emerald-500">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDisconnect}
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleConnect}
      disabled={connecting}
      className="gap-2"
    >
      <Wallet className="w-4 h-4" />
      {connecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
}

