'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasCompletedTutorial: boolean;
  tutorialStatusLoaded: boolean;
  setHasCompletedTutorial: (completed: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(false);
  const [tutorialStatusLoaded, setTutorialStatusLoaded] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session with error handling
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('Supabase session error:', error.message);
          // Check if it's a network error
          if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
            console.error('❌ Cannot connect to Supabase. Check:');
            console.error('   1. NEXT_PUBLIC_SUPABASE_URL is correct');
            console.error('   2. NEXT_PUBLIC_SUPABASE_ANON_KEY is correct');
            console.error('   3. Your Supabase project is active');
            console.error('   4. No network/firewall blocking the connection');
          }
        }
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to get Supabase session:', error);
        if (error.message?.includes('Failed to fetch')) {
          console.error('❌ Network error connecting to Supabase');
        }
        setLoading(false);
      });

    // Listen for auth changes with error handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [supabase]);

  // Check if user has completed tutorial
  useEffect(() => {
    if (user) {
      checkTutorialStatus();
    } else {
      // If no user, mark as loaded so we don't wait forever
      setTutorialStatusLoaded(true);
      setHasCompletedTutorial(false);
    }
  }, [user]);

  const checkTutorialStatus = async () => {
    if (!user) {
      setTutorialStatusLoaded(true);
      return;
    }
    
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      setTutorialStatusLoaded(true);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('tutorial_completed')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setHasCompletedTutorial(data.tutorial_completed || false);
      } else {
        // If no profile exists, default to false
        setHasCompletedTutorial(false);
      }
    } catch (error) {
      console.warn('Failed to check tutorial status (non-critical):', error);
      // Default to false if we can't check
      setHasCompletedTutorial(false);
    } finally {
      setTutorialStatusLoaded(true);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (!error && data.user) {
        // Create user profile
        try {
          await supabase.from('user_profiles').insert({
            id: data.user.id,
            email: data.user.email,
            tutorial_completed: false,
          });
        } catch (profileError) {
          console.warn('Failed to create user profile:', profileError);
          // Continue even if profile creation fails
        }
      }

      return { error };
    } catch (error: any) {
      console.error('Sign up error:', error);
      if (error.message?.includes('Failed to fetch')) {
        return { 
          error: { 
            message: 'Cannot connect to Supabase. Please check your internet connection and Supabase configuration.' 
          } 
        };
      }
      return { error: { message: error.message || 'Failed to sign up' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      console.log('🔐 Attempting to sign in to Supabase:', supabaseUrl);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Supabase sign in error:', error);
        // Check if it's a network error
        if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
          return { 
            error: { 
              message: `Cannot connect to Supabase at ${supabaseUrl}. Please check:\n1. Your Supabase project is active (not paused)\n2. No network/firewall blocking the connection\n3. The URL is correct: ${supabaseUrl}` 
            } 
          };
        }
      }
      
      return { error };
    } catch (error: any) {
      console.error('Sign in exception:', error);
      if (error.message?.includes('Failed to fetch') || error.name === 'TypeError' || error.message?.includes('fetch')) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'unknown';
        return { 
          error: { 
            message: `Network error connecting to Supabase (${supabaseUrl}). This could mean:\n1. Your Supabase project is paused or inactive\n2. Network/firewall is blocking the connection\n3. The Supabase URL is incorrect\n\nCheck your Supabase dashboard to ensure the project is active.` 
          } 
        };
      }
      return { error: { message: error.message || 'Failed to sign in' } };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setHasCompletedTutorial(false);
    } catch (error) {
      console.warn('Sign out error (non-critical):', error);
      // Clear local state even if Supabase sign out fails
      setHasCompletedTutorial(false);
    }
  };

  const updateTutorialStatus = async (completed: boolean) => {
    if (!user) {
      console.warn('Cannot update tutorial status: no user');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ tutorial_completed: completed })
        .eq('id', user.id);

      if (error) {
        console.error('Failed to update tutorial status:', error);
        throw error;
      }

      setHasCompletedTutorial(completed);
      console.log('✅ Tutorial status updated:', completed);
    } catch (error) {
      console.error('Error updating tutorial status:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        hasCompletedTutorial,
        tutorialStatusLoaded,
        setHasCompletedTutorial: updateTutorialStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


