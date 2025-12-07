'use client';

import React, { useState } from 'react';
import { X, ArrowRight, Circle, Hexagon, Square, Diamond, Octagon, Zap, Code, Rocket, CheckCircle2, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
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
  highlight?: string;
}

export default function Tutorial({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const { setHasCompletedTutorial, user } = useAuth();
  const { theme } = useTheme();

  const steps: TutorialStep[] = [
    {
      title: 'Welcome to ChainChart',
      description: 'Build Neo N3 smart contracts visually with AI-powered code generation',
      icon: <Sparkles className="w-10 h-10" />,
      highlight: 'AI-Powered Smart Contract Builder',
      content: (
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <h3 className="text-2xl font-bold text-foreground">Visual Smart Contract Development</h3>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              ChainChart transforms your visual diagrams into production-ready Neo N3 smart contracts. 
              No coding required—just drag, connect, and deploy.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className={`p-6 rounded-xl border-2 ${theme === 'dark' ? 'bg-card border-border' : 'bg-card border-border'} text-center`}>
              <Zap className="w-8 h-8 mx-auto mb-3 text-primary" />
              <h4 className="font-semibold text-foreground mb-2">Visual Builder</h4>
              <p className="text-sm text-muted-foreground">Drag-and-drop interface</p>
            </div>
            <div className={`p-6 rounded-xl border-2 ${theme === 'dark' ? 'bg-card border-border' : 'bg-card border-border'} text-center`}>
              <Code className="w-8 h-8 mx-auto mb-3 text-primary" />
              <h4 className="font-semibold text-foreground mb-2">AI Generation</h4>
              <p className="text-sm text-muted-foreground">SpoonOS AI generates code</p>
            </div>
            <div className={`p-6 rounded-xl border-2 ${theme === 'dark' ? 'bg-card border-border' : 'bg-card border-border'} text-center`}>
              <Rocket className="w-8 h-8 mx-auto mb-3 text-primary" />
              <h4 className="font-semibold text-foreground mb-2">One-Click Deploy</h4>
              <p className="text-sm text-muted-foreground">Deploy to Neo TestNet</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Node Types & Colors',
      description: 'Each node type has a unique shape and color for easy identification',
      icon: <Hexagon className="w-10 h-10" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-5 rounded-xl border-2 ${theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
              <div className="flex items-center gap-3 mb-3">
                <Circle className="w-8 h-8 text-emerald-500" />
                <div>
                  <h4 className="font-bold text-foreground">State</h4>
                  <p className="text-xs text-muted-foreground">Storage Variables</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Stores data on the blockchain. Use for persistent state.</p>
            </div>
            <div className={`p-5 rounded-xl border-2 ${theme === 'dark' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-center gap-3 mb-3">
                <Hexagon className="w-8 h-8 text-blue-500" />
                <div>
                  <h4 className="font-bold text-foreground">Function</h4>
                  <p className="text-xs text-muted-foreground">Public Methods</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Entry points for your contract. Users call these methods.</p>
            </div>
            <div className={`p-5 rounded-xl border-2 ${theme === 'dark' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'}`}>
              <div className="flex items-center gap-3 mb-3">
                <Square className="w-8 h-8 text-purple-500" />
                <div>
                  <h4 className="font-bold text-foreground">Operation</h4>
                  <p className="text-xs text-muted-foreground">Math & Logic</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Perform calculations, comparisons, and data transformations.</p>
            </div>
            <div className={`p-5 rounded-xl border-2 ${theme === 'dark' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex items-center gap-3 mb-3">
                <Diamond className="w-8 h-8 text-amber-500" />
                <div>
                  <h4 className="font-bold text-foreground">Condition</h4>
                  <p className="text-xs text-muted-foreground">If/Else Logic</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Branch your logic. True goes right, False goes down.</p>
            </div>
            <div className={`p-5 rounded-xl border-2 ${theme === 'dark' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-rose-50 border-rose-200'}`}>
              <div className="flex items-center gap-3 mb-3">
                <Octagon className="w-8 h-8 text-rose-500" />
                <div>
                  <h4 className="font-bold text-foreground">Modifier</h4>
                  <p className="text-xs text-muted-foreground">Access Control</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Restrict access to functions (e.g., owner-only).</p>
            </div>
            <div className={`p-5 rounded-xl border-2 ${theme === 'dark' ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <div className="w-6 h-4 bg-cyan-500 transform -skew-x-12" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Event</h4>
                  <p className="text-xs text-muted-foreground">Notifications</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Emit events for off-chain monitoring and indexing.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Connecting Nodes',
      description: 'Build your contract logic by connecting nodes together',
      icon: <ArrowRight className="w-10 h-10" />,
      content: (
        <div className="space-y-6">
          <div className={`p-6 rounded-xl border-2 ${theme === 'dark' ? 'bg-card border-border' : 'bg-card border-border'}`}>
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" />
              How to Connect
            </h4>
            <ol className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
                <span>Click and drag from a <strong className="text-foreground">right/bottom port</strong> (output) of a node</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
                <span>Release on a <strong className="text-foreground">left port</strong> (input) of another node</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</span>
                <span>Delete connections by <strong className="text-foreground">Ctrl/Cmd + Click</strong> on the edge</span>
              </li>
            </ol>
          </div>
          <div className={`p-6 rounded-xl border-2 ${theme === 'dark' ? 'bg-primary/10 border-primary/30' : 'bg-primary/5 border-primary/20'}`}>
            <h4 className="font-semibold text-foreground mb-3">Example Flow</h4>
            <div className="flex items-center gap-2 text-sm">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-500 font-medium">State</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-500 font-medium">Function</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 font-medium">Condition</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-500 font-medium">Operation</span>
            </div>
            <p className="text-xs text-muted-foreground mt-3">This creates: Function → checks Condition → performs Operation</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Generate & Deploy',
      description: 'From diagram to deployed contract in minutes',
      icon: <Rocket className="w-10 h-10" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-6 rounded-xl border-2 ${theme === 'dark' ? 'bg-card border-border' : 'bg-card border-border'}`}>
              <div className="flex items-center gap-3 mb-4">
                <Code className="w-8 h-8 text-primary" />
                <h4 className="font-bold text-foreground">Generate Contract</h4>
              </div>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>SpoonOS AI analyzes your diagram</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Generates Neo N3 C# contract code</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Compiles to NEF + manifest</span>
                </li>
              </ol>
            </div>
            <div className={`p-6 rounded-xl border-2 ${theme === 'dark' ? 'bg-card border-border' : 'bg-card border-border'}`}>
              <div className="flex items-center gap-3 mb-4">
                <Rocket className="w-8 h-8 text-primary" />
                <h4 className="font-bold text-foreground">Deploy to TestNet</h4>
              </div>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>One-click deployment</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Get transaction hash</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>View on Neo Explorer</span>
                </li>
              </ol>
            </div>
          </div>
          <div className={`p-6 rounded-xl border-2 ${theme === 'dark' ? 'bg-primary/10 border-primary/30' : 'bg-primary/5 border-primary/20'}`}>
            <h4 className="font-semibold text-foreground mb-2">💡 Pro Tips</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Each contract gets a <strong className="text-foreground">unique name</strong> automatically to avoid conflicts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Use <strong className="text-foreground">Save</strong> to persist your diagrams to Supabase</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Contracts are saved to Supabase for cross-device access</span>
              </li>
            </ul>
          </div>
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

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (dontShowAgain && user) {
      try {
        await setHasCompletedTutorial(true);
        console.log('✅ Tutorial preference saved: Do not show again');
      } catch (error) {
        console.error('Failed to save tutorial preference:', error);
      }
    }
    onComplete();
  };

  const handleSkip = async () => {
    if (dontShowAgain && user) {
      try {
        await setHasCompletedTutorial(true);
        console.log('✅ Tutorial preference saved: Do not show again');
      } catch (error) {
        console.error('Failed to save tutorial preference:', error);
      }
    }
    onComplete();
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-5xl w-[95vw] max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0 [&>button]:!hidden">
        {/* Header */}
        <DialogHeader className="px-8 pt-8 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-primary/20' : 'bg-primary/10'}`}>
                {steps[currentStep].icon}
              </div>
              <div>
                <DialogTitle className="text-3xl font-bold text-foreground mb-1">
                  {steps[currentStep].title}
                </DialogTitle>
                <DialogDescription className="text-base text-muted-foreground">
                  {steps[currentStep].description}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content - Takes most of the screen */}
        <div className="flex-1 overflow-y-auto px-8 py-6 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {steps[currentStep].content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 pt-4 border-t border-border space-y-4">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 flex-1 rounded-full transition-all ${
                  index <= currentStep
                    ? 'bg-primary'
                    : 'bg-muted'
                } ${index === currentStep ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
          <div className="text-xs text-center text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>

          {/* Don't Show Again Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="dont-show-again"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="dont-show-again" className="text-sm text-muted-foreground cursor-pointer">
              Don't show this tutorial again
            </label>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip Tutorial
            </Button>
            <div className="flex items-center gap-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="border-border"
                >
                  Previous
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="bg-primary text-primary-foreground hover:opacity-90 font-semibold px-6"
              >
                {currentStep < steps.length - 1 ? (
                  <>
                    Next <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                ) : (
                  <>
                    Get Started <CheckCircle2 className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
