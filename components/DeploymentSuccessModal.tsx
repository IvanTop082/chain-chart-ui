'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink, Code, FileCode } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

interface DeploymentSuccessModalProps {
  open: boolean;
  onClose: () => void;
  contractHash: string | null;
  txHash: string | null;
  contractName?: string;
}

export default function DeploymentSuccessModal({
  open,
  onClose,
  contractHash,
  txHash,
  contractName = 'Your Contract'
}: DeploymentSuccessModalProps) {
  const { theme } = useTheme();
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const copyToClipboard = (text: string, setCopied: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const testnetExplorerUrl = contractHash 
    ? `https://dora.coz.io/neotracker/testnet/contract/${contractHash}`
    : txHash
    ? `https://dora.coz.io/neotracker/testnet/tx/${txHash}`
    : null;

  // Example code for connecting to the contract
  const connectionCode = `// Connect to your deployed contract using neon-js
import { rpc, sc, u } from '@cityofzion/neon-js';

const CONTRACT_HASH = "${contractHash || 'YOUR_CONTRACT_HASH'}";
const RPC_URL = "http://seed3t5.neo.org:20332";

// Create RPC client
const client = new rpc.RPCClient(RPC_URL);

// Call a contract method
async function callContractMethod(method: string, params: any[] = []) {
  const script = sc.createScript({
    scriptHash: CONTRACT_HASH,
    operation: method,
    args: params.map(p => sc.ContractParam.any(p))
  });
  
  const result = await client.invokeScript(u.HexString.fromHex(script));
  return result;
}

// Example: Call your contract's "counter" method
const counter = await callContractMethod("counter", []);
console.log("Counter value:", counter.stack[0].value);`;

  const web3Code = `// Using @cityofzion/neon-js in a web app
import { rpc, sc, u } from '@cityofzion/neon-js';

const contractHash = "${contractHash || 'YOUR_CONTRACT_HASH'}";
const rpcUrl = "http://seed3t5.neo.org:20332";

async function invokeContract(method: string, params: any[] = []) {
  const client = new rpc.RPCClient(rpcUrl);
  
  const script = sc.createScript({
    scriptHash: contractHash,
    operation: method,
    args: params.map(p => sc.ContractParam.any(p))
  });
  
  const result = await client.invokeScript(u.HexString.fromHex(script));
  
  // Check execution state
  if (result.state === 'FAULT') {
    throw new Error(\`Contract execution failed: \${result.exception || 'Unknown error'}\`);
  }
  
  // Extract return value from stack
  if (result.stack && result.stack.length > 0) {
    const stackItem = result.stack[0];
    return stackItem.value !== undefined ? stackItem.value : stackItem;
  }
  
  return null;
}

// Example usage - call a read-only method
const counter = await invokeContract("counter", []);
console.log("Counter value:", counter);

// Example usage - call a method with parameters
// const result = await invokeContract("increment", []);`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-popover border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            Contract Deployed Successfully!
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Your contract is now live on Neo N3 TestNet. Use the contract hash below to interact with it from any frontend.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Contract Hash Section */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Contract Hash</label>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
              <code className="flex-1 text-sm font-mono text-foreground break-all">
                {contractHash || 'Hash not available'}
              </code>
              {contractHash && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(contractHash, setCopiedHash)}
                  className="shrink-0"
                >
                  {copiedHash ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
            {txHash && (
              <div className="text-xs text-muted-foreground">
                Transaction: <code className="text-foreground">{txHash}</code>
              </div>
            )}
          </div>

          {/* Explorer Link */}
          {testnetExplorerUrl && (
            <div>
              <Button
                variant="outline"
                onClick={() => window.open(testnetExplorerUrl, '_blank')}
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on TestNet Explorer
              </Button>
            </div>
          )}

          {/* Connection Instructions */}
          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Code className="w-5 h-5" />
              Connect from Your Frontend
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Install neon-js in your frontend project:
                </p>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
                  <code className="flex-1 text-sm font-mono text-foreground">
                    npm install @cityofzion/neon-js
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard('npm install @cityofzion/neon-js', setCopiedCode)}
                  >
                    {copiedCode ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Example code to call your contract:
                </p>
                <div className="relative">
                  <pre className="p-4 bg-muted/30 rounded-lg border border-border overflow-x-auto text-xs font-mono text-foreground">
                    <code>{web3Code}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(web3Code, setCopiedCode)}
                  >
                    {copiedCode ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="space-y-2 border-t border-border pt-4">
            <h4 className="text-sm font-semibold text-foreground">Important Notes:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>This contract is deployed on <strong className="text-foreground">TestNet</strong> - use it for testing only</li>
              <li>The contract hash is permanent and unique to this deployment</li>
              <li>Use the contract hash to invoke methods from any Neo-compatible frontend</li>
              <li>For production, deploy to MainNet using the same process</li>
            </ul>
          </div>

          {/* Close Button */}
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button onClick={onClose} className="bg-primary text-primary-foreground">
              Got it!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

