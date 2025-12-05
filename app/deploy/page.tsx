'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, Terminal, Shield, Globe, Cpu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Deploy() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [step, setStep] = useState(0); // 0: idle, 1: compiling, 2: verifying, 3: deploying, 4: success

  const handleDeploy = () => {
    setIsDeploying(true);
    setStep(1);
    
    // Simulate process
    setTimeout(() => setStep(2), 1500);
    setTimeout(() => setStep(3), 3000);
    setTimeout(() => setStep(4), 5000);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-3">Deploy to Network</h1>
        <p className="text-gray-400">Review your contract configuration and launch to the blockchain.</p>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contract Summary */}
        <Card className="bg-white/5 border-white/10 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
                <Cpu className="w-24 h-24 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-neon-yellow" /> Contract Details
            </h3>
            
            <div className="space-y-4">
                <DetailRow label="Name" value="My First Token" />
                <DetailRow label="Network" value="Ethereum Sepolia" />
                <DetailRow label="Compiler" value="v0.8.19 (commit.7dd6d404)" />
                <DetailRow label="Optimization" value="Enabled (200 runs)" />
                <div className="h-px bg-white/10 my-4" />
                <DetailRow label="Est. Gas Cost" value="0.004 ETH" valueColor="text-neon-yellow" />
            </div>
        </Card>

        {/* Deploy Actions */}
        <Card className="bg-black border border-white/10 p-6 flex flex-col justify-between shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div>
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-emerald-green" /> Network Status
                </h3>
                
                <div className="flex items-center gap-3 bg-emerald-green/10 border border-emerald-green/20 p-3 rounded-lg mb-6">
                    <div className="relative">
                        <div className="w-2 h-2 bg-emerald-green rounded-full" />
                        <div className="absolute inset-0 bg-emerald-green rounded-full animate-ping opacity-50" />
                    </div>
                    <span className="text-sm text-emerald-green font-medium">Connected to Sepolia</span>
                </div>

                <div className="space-y-3">
                    <StepIndicator status={step > 0 ? 'completed' : step === 0 ? 'current' : 'pending'} label="Compilation" />
                    <StepIndicator status={step > 1 ? 'completed' : step === 1 ? 'current' : 'pending'} label="Security Scan" />
                    <StepIndicator status={step > 3 ? 'completed' : step === 3 ? 'current' : 'pending'} label="Deployment Transaction" />
                </div>
            </div>

            <div className="mt-8">
                {step === 4 ? (
                    <Button className="w-full bg-emerald-green text-black hover:bg-emerald-green/90 font-bold h-12 text-md">
                        <CheckCircle className="w-5 h-5 mr-2" /> Deployed Successfully
                    </Button>
                ) : (
                    <Button 
                        onClick={handleDeploy} 
                        disabled={isDeploying}
                        className="w-full bg-neon-yellow text-black hover:bg-[#DCD008] font-bold h-12 text-md disabled:opacity-50"
                    >
                        {isDeploying ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Shield className="w-5 h-5 mr-2" />}
                        {isDeploying ? 'Processing...' : 'Deploy Contract'}
                    </Button>
                )}
            </div>
        </Card>
      </div>
    </div>
  );
}

function DetailRow({ label, value, valueColor = "text-gray-300" }) {
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">{label}</span>
            <span className={`font-mono font-medium ${valueColor}`}>{value}</span>
        </div>
    )
}

function StepIndicator({ status, label }) {
    // status: pending, current, completed
    const styles = {
        pending: "border-white/10 text-gray-600",
        current: "border-neon-yellow text-neon-yellow bg-neon-yellow/10",
        completed: "border-emerald-green text-emerald-green bg-emerald-green/10"
    };

    return (
        <div className={`flex items-center gap-3 p-3 rounded-lg border ${styles[status]} transition-all duration-500`}>
            {status === 'completed' ? (
                <CheckCircle className="w-4 h-4" />
            ) : status === 'current' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <div className="w-4 h-4 rounded-full border-2 border-current opacity-20" />
            )}
            <span className="text-sm font-medium">{label}</span>
        </div>
    )
}