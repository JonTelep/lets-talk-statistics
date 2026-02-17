'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Sun, Moon, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

const navLinks = [
  { name: 'CONGRESS', href: '/congress', status: 'HIGH' },
  { name: 'IMMIGRATION', href: '/immigration', status: 'ACTIVE' },
  { name: 'BUDGET', href: '/budget', status: 'CRITICAL' },
  { name: 'EMPLOYMENT', href: '/employment', status: 'TRACKED' },
  { name: 'DEBT', href: '/debt', status: 'URGENT' },
  { name: 'ELECTIONS', href: '/elections', status: 'ACTIVE' },
  { name: 'ABOUT', href: '/about', status: 'INFO' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'CRITICAL': return 'text-red-500';
    case 'URGENT': return 'text-red-400';
    case 'HIGH': return 'text-orange-500';
    case 'ACTIVE': return 'text-yellow-500';
    case 'TRACKED': return 'text-green-500';
    case 'INFO': return 'text-blue-500';
    default: return 'text-surface-400';
  }
};

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="nav-brutal sticky top-0 z-50 bg-surface">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between h-20">
          {/* BRUTAL LOGO */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 border-2 border-accent bg-accent flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-surface" />
            </div>
            <div className="flex flex-col">
              <span className="text-brutal text-base text-text-primary leading-none">
                LET'S TALK
              </span>
              <span className="text-brutal text-sm text-accent leading-none">
                STATISTICS
              </span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION - TERMINAL STYLE */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="group px-3 py-2 relative font-mono text-xs font-medium"
              >
                <div className="text-surface-400 group-hover:text-text-primary transition-colors duration-200">
                  {link.name}
                </div>
                <div className={`text-xs ${getStatusColor(link.status)} opacity-60 group-hover:opacity-100`}>
                  [{link.status}]
                </div>
                {/* Hover accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </Link>
            ))}
            
            {/* THEME TOGGLE - BRUTAL STYLE */}
            <button
              onClick={toggleTheme}
              className="ml-6 p-2 border-2 border-surface-600 hover:border-accent text-surface-400 hover:text-accent transition-colors duration-200 relative"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500"></div>
            </button>
          </div>

          {/* MOBILE MENU BUTTONS */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 border border-surface-600 text-surface-400 hover:text-accent transition-colors"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              className="p-2 border-2 border-surface-600 hover:border-accent text-surface-400 hover:text-accent transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE MENU - TERMINAL STYLE */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t-2 border-accent py-6 bg-surface-950">
            <div className="font-mono text-sm">
              <div className="text-accent mb-4 px-3">$ navigation --mobile</div>
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="group px-6 py-3 hover:bg-surface-800 border-l-2 border-transparent hover:border-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-surface-300 group-hover:text-text-primary">
                        {link.name}
                      </span>
                      <span className={`text-xs ${getStatusColor(link.status)}`}>
                        [{link.status}]
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-green-500 mt-4 px-6">$ menu_active: true</div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}