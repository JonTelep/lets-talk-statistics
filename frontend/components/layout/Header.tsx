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
    <header className="bg-surface/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex w-full items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="flex flex-col">
              <span className="text-2xl font-serif font-bold tracking-tight text-text-primary group-hover:text-editorial-red transition-colors duration-300">
                Let&apos;s Talk Statistics
              </span>
              <span className="caption text-text-muted mt-1">
                Government Data • Editorial Rigor
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-8">
            <nav className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="nav-link"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            
            <div className="w-px h-6 bg-border mx-2"></div>
            
            <button
              onClick={toggleTheme}
              className="p-3 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-100 transition-all duration-200"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile menu buttons */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 text-text-muted hover:text-text-primary transition-colors"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              type="button"
              className="p-2 text-text-muted hover:text-text-primary transition-colors"
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
          <div className="lg:hidden border-t border-border bg-surface-50">
            <div className="py-6 px-4">
              <div className="grid grid-cols-2 gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="block py-3 px-4 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-100 transition-all duration-200 font-serif font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex flex-col gap-3">
                  <Link
                    href="/about"
                    className="btn-editorial-secondary text-sm py-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Our Methodology
                  </Link>
                  <Link
                    href="/debt"
                    className="btn-editorial-primary text-sm py-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Explore Data
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}