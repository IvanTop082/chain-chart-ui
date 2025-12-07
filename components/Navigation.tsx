'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Box, Plus, LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { createPageUrl } from '@/utils';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) {
    return null; // Don't show navigation for unauthenticated users
  }

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: createPageUrl('Contracts'), label: 'My Contracts', icon: Box },
    { href: createPageUrl('Builder'), label: 'New Project', icon: Plus },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="h-16 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center">
            <Box className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground text-lg">ChainChart</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={active ? "default" : "ghost"}
                  className={`h-10 px-4 ${
                    active
                      ? 'bg-primary text-primary-foreground hover:opacity-90 font-bold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hidden sm:flex"
            onClick={async () => {
              await signOut();
              router.push('/');
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/80 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={active ? "default" : "ghost"}
                    className={`w-full justify-start h-10 ${
                      active
                        ? 'bg-primary text-primary-foreground hover:opacity-90 font-bold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              className="w-full justify-start h-10 text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-10 text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={async () => {
                await signOut();
                router.push('/');
                setMobileMenuOpen(false);
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}


