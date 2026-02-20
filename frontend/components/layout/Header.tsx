'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

const navLinks = [
  { name: 'Congress', href: '/congress' },
  { name: 'Housing', href: '/housing' },
  { name: 'Immigration', href: '/immigration' },
  { name: 'Budget', href: '/budget' },
  { name: 'Employment', href: '/employment' },
  { name: 'Debt', href: '/debt' },
  { name: 'Elections', href: '/elections' },
  { name: 'About', href: '/about' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-surface/95 backdrop-blur-sm border-b-2 border-accent sticky top-0 z-50">
      {/* Editorial Masthead */}
      <div className="border-b border-border-subtle">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="font-mono text-text-dim">EST. 2024</span>
              <span className="font-mono text-text-dim">•</span>
              <span className="font-mono text-text-dim">GOVERNMENT DATA ANALYSIS</span>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <span className="font-mono text-text-dim">UPDATED DAILY</span>
              <button
                onClick={toggleTheme}
                className="p-1 rounded text-text-dim hover:text-accent transition-colors duration-200"
                aria-label={`Switch to ${theme === 'editorial' ? 'editorial-dark' : 'editorial'} mode`}
              >
                {theme === 'editorial-dark' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex w-full items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="text-center">
              <div className="font-display text-2xl sm:text-3xl font-medium text-text-primary group-hover:text-accent transition-colors tracking-tight">
                Let's Talk <em className="text-accent">Statistics</em>
              </div>
              <div className="font-mono text-xs text-text-muted tracking-widest">
                DATA • ANALYSIS • TRANSPARENCY
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="nav-link text-base py-2"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 text-text-muted hover:text-accent transition-colors sm:hidden"
              aria-label={`Switch to ${theme === 'editorial' ? 'editorial-dark' : 'editorial'} mode`}
            >
              {theme === 'editorial-dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              className="p-2 text-text-muted hover:text-accent transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border-medium py-6 bg-surface-50">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-4 py-3 text-lg font-serif font-medium text-text-secondary hover:text-accent hover:bg-surface-100 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            {/* Mobile footer */}
            <div className="px-4 pt-6 border-t border-border mt-6">
              <p className="font-mono text-xs text-text-muted text-center">
                DATA WITHOUT SPIN
              </p>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}