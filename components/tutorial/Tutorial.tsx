'use client';

import React, { useState } from 'react';
import { X, ArrowRight, Circle, Hexagon, Square, Triangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function Tutorial({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const { setHasCompletedTutorial } = useAuth();

  const steps: TutorialStep[] = [
    {
      title: 'Welcome to ChainChart!',
      description: 'Build smart contracts visually with drag-and-drop',
      icon: <Circle className="w-8 h-8 text-neon-yellow" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 leading-relaxed">
            ChainChart lets you create Ethereum smart contracts without writing code. 
            Simply drag shapes onto the canvas and connect them to build your contract logic.
          </p>
        </div>
      ),
    },
    {
      title: 'Understanding Node Types',
      description: 'Learn about the different building blocks',
      icon: <Hexagon className="w-8 h-8 text-emerald-green" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <Circle className="w-6 h-6 text-emerald-green mb-2" />
              <h4 className="font-bold text-white text-sm mb-1">State</h4>
              <p className="text-xs text-gray-400">Variables & Storage</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <Hexagon className="w-6 h-6 text-emerald-green mb-2" />
              <h4 className="font-bold text-white text-sm mb-1">Function</h4>
              <p className="text-xs text-gray-400">Contract Functions</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <Square className="w-6 h-6 text-neon-yellow mb-2" />
              <h4 className="font-bold text-white text-sm mb-1">Condition</h4>
              <p className="text-xs text-gray-400">If/Else Logic</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <Square className="w-6 h-6 text-emerald-green mb-2" />
              <h4 className="font-bold text-white text-sm mb-1">Operation</h4>
              <p className="text-xs text-gray-400">Math & Logic</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Connecting Nodes',
      description: 'Drag from output ports to input ports',
      icon: <ArrowRight className="w-8 h-8 text-emerald-green" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 leading-relaxed">
            Connect nodes by dragging from the <strong className="text-white">right/bottom ports</strong> (outputs) 
            to the <strong className="text-white">left ports</strong> (inputs).
          </p>
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-sm text-gray-300">
              <span className="text-emerald-green">State</span> → <span className="text-emerald-green">Function</span> → <span className="text-neon-yellow">Condition</span> → <span className="text-emerald-green">Operation</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Live Code Preview',
      description: 'Watch your contract generate in real-time',
      icon: <Triangle className="w-8 h-8 text-neon-yellow" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 leading-relaxed">
            As you build your visual diagram, Solidity code is generated automatically in the 
            <strong className="text-white"> Live Preview</strong> panel at the bottom.
          </p>
          <p className="text-sm text-gray-400">
            You can copy or export the generated code when ready!
          </p>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    await setHasCompletedTutorial(true);
    onComplete();
  };

  const handleSkip = async () => {
    await setHasCompletedTutorial(true);
    onComplete();
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            {steps[currentStep].icon}
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                {steps[currentStep].title}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-400 mt-1">
                {steps[currentStep].description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mb-6 min-h-[200px]">
          {steps[currentStep].content}
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-all ${
                index <= currentStep
                  ? 'bg-neon-yellow'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-gray-400 hover:text-white"
          >
            Skip Tutorial
          </Button>
          <Button
            onClick={handleNext}
            className="text-black font-bold"
            style={{
              backgroundColor: '#F4E409',
              boxShadow: '0 0 20px rgba(244, 228, 9, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#DCD008';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(244, 228, 9, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F4E409';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(244, 228, 9, 0.4)';
            }}
          >
            {currentStep < steps.length - 1 ? (
              <>
                Next <ArrowRight className="ml-2 w-4 h-4" />
              </>
            ) : (
              'Get Started'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


