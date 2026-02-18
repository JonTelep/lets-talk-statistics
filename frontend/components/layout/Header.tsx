'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Sun, Moon, Calendar } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

const navLinks = [
  { name: 'Congress', href: '/congress', category: 'Politics' },
  { name: 'Housing', href: '/housing', category: 'Economics' },
  { name: 'Immigration', href: '/immigration', category: 'Policy' },
  { name: 'Budget', href: '/budget', category: 'Economics' },
  { name: 'Employment', href: '/employment', category: 'Economics' },
  { name: 'Debt', href: '/debt', category: 'Economics' },
  { name: 'Elections', href: '/elections', category: 'Politics' },
  { name: 'About', href: '/about', category: 'Editorial' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-surface-paper/95 backdrop-blur-sm border-b-2 border-editorial-burgundy sticky top-0 z-50">
      {/* Editorial Header Bar */}
      <div className="border-b border-border-subtle">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-4 text-xs text-fg-muted">
              <Calendar className="h-3 w-3" />
              <span className="font-sans tracking-wide">{currentDate}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs font-sans text-fg-muted tracking-widest">INDEPENDENT ANALYSIS</span>
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded text-fg-muted hover:text-editorial-burgundy hover:bg-surface-accent transition-all duration-200"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main Navigation">
        <div className="flex w-full items-center justify-between h-20">
          {/* Logo/Masthead */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-1 h-12 bg-editorial-burgundy"></div>
            <div>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-editorial-navy group-hover:text-editorial-burgundy transition-colors">
                Let's Talk Statistics
              </div>
              <div className="text-xs font-sans text-fg-muted tracking-widest -mt-1">
                GOVERNMENT DATA • OBJECTIVE ANALYSIS
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="group px-4 py-3 relative"
              >
                <div className="text-sm font-medium text-fg-secondary group-hover:text-editorial-burgundy transition-colors duration-200">
                  {link.name}
                </div>
                <div className="text-xs text-fg-dim group-hover:text-editorial-burgundy/70 transition-colors duration-200">
                  {link.category}
                </div>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-editorial-burgundy scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              type="button"
              className="p-2 text-fg-secondary hover:text-editorial-burgundy hover:bg-surface-accent rounded transition-all duration-200"
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
          <div className="lg:hidden border-t-2 border-editorial-burgundy bg-surface-accent">
            <div className="py-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block px-4 py-3 border-l-4 border-transparent hover:border-editorial-burgundy hover:bg-surface-warm transition-all duration-200 group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="text-base font-medium text-fg-primary group-hover:text-editorial-burgundy">
                    {link.name}
                  </div>
                  <div className="text-xs text-fg-muted group-hover:text-editorial-burgundy/70">
                    {link.category}
                  </div>
                </Link>
              ))}
            </div>
            <div className="border-t border-border-subtle px-4 py-4">
              <div className="text-xs text-fg-muted text-center">
                {currentDate} • Independent Data Analysis
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
