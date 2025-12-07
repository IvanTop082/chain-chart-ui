'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const { theme } = useTheme();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
          toast.error('Sign up failed', {
            description: error.message,
          });
        } else {
          setMessage('Account created! Please check your email to verify your account.');
          toast.success('Account created!', {
            description: 'Please check your email to verify your account.',
          });
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
          toast.error('Sign in failed', {
            description: error.message,
          });
        } else {
          toast.success('Welcome back!', {
            description: 'You have been signed in successfully.',
          });
          onClose();
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      toast.error('Authentication error', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-foreground">
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base">
            {mode === 'signup' 
              ? 'Start building smart contracts visually' 
              : 'Sign in to continue building'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-10 bg-background border-border text-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 bg-background border-border text-foreground"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
              {message}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {mode === 'signup' ? 'Creating...' : 'Signing in...'}
              </>
            ) : (
              mode === 'signup' ? 'Create Account' : 'Sign In'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
              setMessage(null);
            }}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {mode === 'signin' 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


