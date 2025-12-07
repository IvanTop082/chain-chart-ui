/**
 * Debug helper to inspect NeoLine API structure
 * Run this in browser console to see what's available
 */

export function debugNeoLine() {
  if (typeof window === 'undefined') {
    console.log('Not in browser environment');
    return;
  }
  
  console.log('=== NeoLine API Debug ===');
  console.log('window.NEOLineN3:', window.NEOLineN3);
  console.log('window.onegate:', window.onegate);
  console.log('window.neoline:', window.neoline);
  console.log('window.NEOLine:', (window as any).NEOLine);
  
  if (window.NEOLineN3) {
    console.log('NEOLineN3 type:', typeof window.NEOLineN3);
    console.log('NEOLineN3 keys:', Object.keys(window.NEOLineN3));
    console.log('NEOLineN3.getAccount:', typeof (window.NEOLineN3 as any).getAccount);
    
    // Try to see the actual structure
    const neoline = window.NEOLineN3 as any;
    console.log('NEOLineN3 structure:', {
      getAccount: typeof neoline.getAccount,
      deploy: typeof neoline.deploy,
      invoke: typeof neoline.invoke,
      provider: neoline.provider,
      api: neoline.api,
    });
  }
  
  console.log('=== End Debug ===');
}

// Make it available globally for console debugging
if (typeof window !== 'undefined') {
  (window as any).debugNeoLine = debugNeoLine;
}




