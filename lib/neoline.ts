/**
 * NeoLine Wallet Integration
 * 
 * NeoLine is a browser extension wallet for Neo blockchain.
 * This module provides functions to connect to NeoLine and interact with it.
 */

// NeoLine N3 API types
interface NeoLineN3 {
  getAccount(): Promise<{
    address: string;
    label?: string;
  }>;
  
  invoke(params: {
    scriptHash: string;
    operation: string;
    args?: any[];
    fee?: string;
    broadcastOverride?: boolean;
    signers?: Array<{
      account: string;
      scopes: number;
    }>;
  }): Promise<{
    txid: string;
    nodeUrl?: string;
  }>;
  
  deploy(params: {
    nef: string; // Base64 encoded NEF
    manifest: string; // JSON string manifest
    name?: string;
    version?: string;
    author?: string;
    email?: string;
    description?: string;
  }): Promise<{
    txid: string;
    nodeUrl?: string;
  }>;
  
  signMessage(params: {
    message: string;
  }): Promise<{
    publicKey: string;
    data: string;
    salt: string;
  }>;
}

declare global {
  interface Window {
    NEOLineN3?: NeoLineN3 | any;
    onegate?: NeoLineN3 | any; // Alternative name
    neoline?: any;
    debugNeoLine?: () => void;
  }
}

/**
 * Wait for NeoLine to be injected and initialized (extensions can take time to load)
 */
async function waitForNeoLine(maxWaitMs: number = 5000): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitMs) {
    // Check if any NeoLine object exists
    const hasNeoLine = !!(
      window.NEOLineN3 ||
      window.onegate ||
      window.neoline ||
      (window as any).NEOLine
    );
    
    if (hasNeoLine) {
      // Also check if it's not just an empty object
      const neoline = window.NEOLineN3 || window.onegate || window.neoline || (window as any).NEOLine;
      if (neoline && typeof neoline === 'object') {
        const keys = Object.keys(neoline);
        // If it has methods or properties, it's likely initialized
        if (keys.length > 0 || typeof neoline.getAccount === 'function') {
          return true;
        }
      } else if (typeof neoline === 'function') {
        return true;
      }
    }
    
    // Wait 100ms before checking again
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return false;
}

/**
 * Check if NeoLine wallet is installed
 * This checks immediately - use waitForNeoLine() if timing is an issue
 */
export function isNeoLineInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check various possible NeoLine API patterns
  const hasNeoLine = !!(
    window.NEOLineN3 ||
    window.onegate ||
    window.neoline ||
    (window as any).NEOLine
  );
  
  // Debug: Log what's available
  if (hasNeoLine && typeof console !== 'undefined') {
    console.log('NeoLine detected. Available objects:', {
      NEOLineN3: !!window.NEOLineN3,
      onegate: !!window.onegate,
      neoline: !!window.neoline,
      NEOLine: !!(window as any).NEOLine,
    });
    
    if (window.NEOLineN3) {
      console.log('NEOLineN3 structure:', {
        type: typeof window.NEOLineN3,
        keys: Object.keys(window.NEOLineN3),
        hasGetAccount: typeof (window.NEOLineN3 as any).getAccount,
      });
    }
  }
  
  return hasNeoLine;
}

/**
 * Get the NeoLine instance
 * NeoLine API can vary - try multiple patterns
 */
export function getNeoLine(): any {
  if (typeof window === 'undefined') return null;
  
  // Try different possible API patterns
  if (window.NEOLineN3) {
    // If it's an object with methods
    if (typeof window.NEOLineN3 === 'object' && window.NEOLineN3.getAccount) {
      return window.NEOLineN3;
    }
    // If methods are on the object itself
    return window.NEOLineN3;
  }
  
  if (window.onegate) {
    if (typeof window.onegate === 'object' && (window.onegate as any).getAccount) {
      return window.onegate;
    }
    return window.onegate;
  }
  
  if (window.neoline) {
    return window.neoline;
  }
  
  if ((window as any).NEOLine) {
    return (window as any).NEOLine;
  }
  
  return null;
}

/**
 * Connect to NeoLine wallet
 * Returns the connected account address
 */
export async function connectNeoLine(): Promise<{
  address: string;
  label?: string;
}> {
  if (typeof window === 'undefined') {
    throw new Error('NeoLine can only be used in browser environment');
  }
  
  // Wait for NeoLine to be injected (extensions can take time)
  const isAvailable = await waitForNeoLine(3000);
  
  // Check if NeoLine is installed
  if (!isAvailable && !isNeoLineInstalled()) {
    throw new Error(
      'NeoLine wallet is not installed or not detected. ' +
      'Please:\n' +
      '1. Install the NeoLine extension from: https://neoline.io/\n' +
      '2. Make sure the extension is enabled\n' +
      '3. Refresh the page after installing\n' +
      '4. Check that you\'re using NeoLine N3 (not NeoLine for Neo2)'
    );
  }
  
  try {
    let account: any = null;
    const debugInfo: any = {
      NEOLineN3: !!window.NEOLineN3,
      onegate: !!window.onegate,
      neoline: !!window.neoline,
      NEOLine: !!(window as any).NEOLine,
    };
    
    // Wait a bit more for NeoLine to fully initialize
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Pattern 1: Try window.NEOLineN3.getAccount() directly
    if (window.NEOLineN3) {
      const neolineN3 = window.NEOLineN3 as any;
      debugInfo.NEOLineN3Type = typeof neolineN3;
      debugInfo.NEOLineN3Keys = Object.keys(neolineN3);
      
      // Check if it's an empty object - might need initialization
      if (Object.keys(neolineN3).length === 0) {
        console.warn('NEOLineN3 is an empty object. It might need initialization or the extension might not be fully loaded.');
        console.warn('Try: 1) Refresh the page, 2) Unlock your NeoLine wallet, 3) Check if extension is enabled');
      }
      
      // Try multiple patterns - including checking if methods are on prototype
      const patterns = [
        // Direct method
        () => typeof neolineN3.getAccount === 'function' ? neolineN3.getAccount() : null,
        // Provider pattern
        () => neolineN3.provider && typeof neolineN3.provider.getAccount === 'function' ? neolineN3.provider.getAccount() : null,
        // API pattern
        () => neolineN3.api && typeof neolineN3.api.getAccount === 'function' ? neolineN3.api.getAccount() : null,
        // Account pattern
        () => neolineN3.account && typeof neolineN3.account.getAccount === 'function' ? neolineN3.account.getAccount() : null,
        // Check prototype
        () => {
          const proto = Object.getPrototypeOf(neolineN3);
          if (proto && typeof proto.getAccount === 'function') {
            return proto.getAccount.call(neolineN3);
          }
          return null;
        },
        // Try if it's a constructor/class that needs instantiation
        () => {
          if (typeof neolineN3 === 'function') {
            try {
              const instance = new neolineN3();
              return typeof instance.getAccount === 'function' ? instance.getAccount() : null;
            } catch (e) {
              return null;
            }
          }
          return null;
        },
      ];
      
      for (const pattern of patterns) {
        try {
          const result = pattern();
          if (result) {
            account = await result;
            if (account && account.address) break;
          }
        } catch (e) {
          // Continue to next pattern
          console.debug('Pattern failed:', e);
        }
      }
    }
    
    // Pattern 2: Try window.onegate
    if (!account && window.onegate) {
      const onegate = window.onegate as any;
      try {
        if (typeof onegate.getAccount === 'function') {
          account = await onegate.getAccount();
        } else if (onegate.provider && typeof onegate.provider.getAccount === 'function') {
          account = await onegate.provider.getAccount();
        }
      } catch (e) {
        // Continue
      }
    }
    
    // Pattern 3: Try window.neoline (lowercase)
    if (!account && window.neoline) {
      const neoline = window.neoline as any;
      try {
        if (typeof neoline.getAccount === 'function') {
          account = await neoline.getAccount();
        } else if (neoline.provider && typeof neoline.provider.getAccount === 'function') {
          account = await neoline.provider.getAccount();
        }
      } catch (e) {
        // Continue
      }
    }
    
    // Pattern 4: Try NEOLine (alternative name)
    if (!account && (window as any).NEOLine) {
      const neoline = (window as any).NEOLine;
      try {
        if (typeof neoline.getAccount === 'function') {
          account = await neoline.getAccount();
        } else if (neoline.provider && typeof neoline.provider.getAccount === 'function') {
          account = await neoline.provider.getAccount();
        }
      } catch (e) {
        // Continue
      }
    }
    
    // Pattern 5: Try direct property access (some versions expose account directly)
    if (!account && window.NEOLineN3) {
      const neolineN3 = window.NEOLineN3 as any;
      try {
        if (neolineN3.account && neolineN3.account.address) {
          account = neolineN3.account;
        } else if (neolineN3.address) {
          account = { address: neolineN3.address };
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (!account || !account.address) {
      // Enhanced debug logging
      console.error('=== NeoLine API Debug Info ===');
      console.error('Available objects:', debugInfo);
      
      if (window.NEOLineN3) {
        const neolineN3 = window.NEOLineN3 as any;
        const keys = Object.keys(neolineN3);
        const proto = Object.getPrototypeOf(neolineN3);
        const protoKeys = proto ? Object.keys(proto) : [];
        
        console.error('NEOLineN3 structure:', {
          type: typeof neolineN3,
          keys: keys,
          keysLength: keys.length,
          hasGetAccount: typeof neolineN3.getAccount,
          hasProvider: !!neolineN3.provider,
          hasApi: !!neolineN3.api,
          hasAccount: !!neolineN3.account,
          prototype: proto,
          prototypeKeys: protoKeys,
          isFunction: typeof neolineN3 === 'function',
          isObject: typeof neolineN3 === 'object',
          fullObject: neolineN3,
        });
        
        // If it's an empty object, provide specific guidance
        if (keys.length === 0) {
          console.error('⚠️ NEOLineN3 is an empty object! This usually means:');
          console.error('   1. Extension is installed but not fully initialized');
          console.error('   2. Extension needs to be unlocked');
          console.error('   3. Page needs a refresh after extension installation');
          console.error('   4. Extension might be disabled');
        }
      }
      
      // Check all window properties that might be NeoLine
      console.error('All window properties containing "neo" or "line":', 
        Object.keys(window).filter(k => 
          k.toLowerCase().includes('neo') || 
          k.toLowerCase().includes('line')
        )
      );
      
      console.error('=== End Debug Info ===');
      console.error('💡 TIP: Open browser console (F12) and run: window.debugNeoLine() for more details');
      console.error('💡 TIP: Try refreshing the page and unlocking your NeoLine wallet');
      
      throw new Error(
        'NeoLine API structure not recognized. ' +
        'NEOLineN3 exists but appears to be empty or not initialized.\n\n' +
        'Please try:\n' +
        '1. Unlock your NeoLine wallet (click the extension icon)\n' +
        '2. Refresh this page (F5 or Ctrl+R)\n' +
        '3. Make sure NeoLine N3 extension is enabled in browser settings\n' +
        '4. Check browser console (F12) for detailed debug info\n' +
        '5. If still not working, try reinstalling the NeoLine extension'
      );
    }
    
    if (!account.address) {
      throw new Error('Failed to get account address from NeoLine. Make sure your wallet is unlocked.');
    }
    
    return account;
  } catch (error: any) {
    const errorMsg = error.message || String(error);
    throw new Error(`Failed to connect to NeoLine: ${errorMsg}`);
  }
}

/**
 * Deploy a contract using NeoLine wallet
 */
export async function deployContractWithNeoLine(params: {
  nef: string; // Base64 encoded NEF
  manifest: string; // JSON string manifest
  name?: string;
  version?: string;
  author?: string;
  email?: string;
  description?: string;
}): Promise<{
  txid: string;
  nodeUrl?: string;
}> {
  if (!isNeoLineInstalled()) {
    throw new Error('NeoLine wallet is not installed');
  }
  
  try {
    let result: any = null;
    const deployParams = {
      nef: params.nef,
      manifest: params.manifest,
      name: params.name || 'ChainChart Contract',
      version: params.version || '1.0.0',
      author: params.author || 'ChainChart',
      email: params.email || '',
      description: params.description || 'Generated from ChainChart diagram',
    };
    
    // Try different API patterns for deploy
    if (window.NEOLineN3) {
      const neolineN3 = window.NEOLineN3 as any;
      
      // Try multiple patterns
      const patterns = [
        () => typeof neolineN3.deploy === 'function' ? neolineN3.deploy(deployParams) : null,
        () => neolineN3.provider && typeof neolineN3.provider.deploy === 'function' ? neolineN3.provider.deploy(deployParams) : null,
        () => neolineN3.api && typeof neolineN3.api.deploy === 'function' ? neolineN3.api.deploy(deployParams) : null,
        () => neolineN3.account && typeof neolineN3.account.deploy === 'function' ? neolineN3.account.deploy(deployParams) : null,
      ];
      
      for (const pattern of patterns) {
        try {
          const patternResult = pattern();
          if (patternResult) {
            result = await patternResult;
            if (result && result.txid) break;
          }
        } catch (e) {
          // Continue to next pattern
        }
      }
    }
    
    // Try other window objects
    if (!result) {
      const alternatives = [window.onegate, window.neoline, (window as any).NEOLine];
      for (const alt of alternatives) {
        if (alt) {
          try {
            if (typeof alt.deploy === 'function') {
              result = await alt.deploy(deployParams);
              if (result && result.txid) break;
            } else if (alt.provider && typeof alt.provider.deploy === 'function') {
              result = await alt.provider.deploy(deployParams);
              if (result && result.txid) break;
            }
          } catch (e) {
            // Continue
          }
        }
      }
    }
    
    if (!result || !result.txid) {
      console.error('Deploy method not found. Available methods:', {
        NEOLineN3: window.NEOLineN3 ? Object.keys(window.NEOLineN3 as any) : [],
      });
      throw new Error('Deploy method not found in NeoLine API. Check browser console for details.');
    }
    
    return result;
  } catch (error: any) {
    throw new Error(`Deployment failed: ${error.message || error}`);
  }
}

/**
 * Invoke a contract method using NeoLine wallet
 */
export async function invokeContractWithNeoLine(params: {
  scriptHash: string;
  operation: string;
  args?: any[];
  fee?: string;
}): Promise<{
  txid: string;
  nodeUrl?: string;
}> {
  const neoline = getNeoLine();
  
  if (!neoline) {
    throw new Error('NeoLine wallet is not installed');
  }
  
  try {
    const result = await neoline.invoke({
      scriptHash: params.scriptHash,
      operation: params.operation,
      args: params.args || [],
      fee: params.fee,
    });
    
    return result;
  } catch (error: any) {
    throw new Error(`Invoke failed: ${error.message || error}`);
  }
}

