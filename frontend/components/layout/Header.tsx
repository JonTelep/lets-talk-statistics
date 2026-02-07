'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, BarChart3, ChevronDown, TrendingUp, Users, DollarSign, Briefcase, Building2, Crown } from 'lucide-react';

const categories = [
  {
    name: 'Congressional Trading',
    href: '/congress',
    icon: TrendingUp,
    description: 'Stock trades by members of Congress',
    subItems: [
      { name: 'Overview', href: '/congress' },
      { name: 'By Politician', href: '/congress/politicians' },
      { name: 'Recent Trades', href: '/congress/trades' },
    ],
  },
  {
    name: 'Immigration',
    href: '/immigration',
    icon: Users,
    description: 'Immigration and deportation statistics',
    subItems: [
      { name: 'Overview', href: '/immigration' },
      { name: 'Trends', href: '/immigration/trends' },
    ],
  },
  {
    name: 'Federal Budget',
    href: '/budget',
    icon: DollarSign,
    description: 'Government spending and revenue',
    subItems: [
      { name: 'Overview', href: '/budget' },
      { name: 'By Agency', href: '/budget/agencies' },
    ],
  },
  {
    name: 'Employment',
    href: '/employment',
    icon: Briefcase,
    description: 'Unemployment and jobs data',
    subItems: [
      { name: 'Overview', href: '/employment' },
      { name: 'By State', href: '/employment/states' },
    ],
  },
  {
    name: 'National Debt',
    href: '/debt',
    icon: Building2,
    description: 'Federal debt and deficit tracking',
    subItems: [
      { name: 'Overview', href: '/debt' },
      { name: 'Historical', href: '/debt/historical' },
    ],
  },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCategoriesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b-4 border-federal-navy-900 sticky top-0 z-50 shadow-brutal">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-federal-navy-900 border-2 border-federal-gold-500 flex items-center justify-center group-hover:bg-federal-red-600 transition-colors">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="block text-xl font-serif font-bold text-federal-navy-900 leading-none">
                  LET'S TALK
                </span>
                <span className="block text-sm font-sans font-semibold text-federal-red-600 uppercase tracking-wide leading-none">
                  STATISTICS
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-sans font-semibold text-federal-charcoal-700 hover:bg-federal-navy-50 hover:text-federal-navy-900 uppercase tracking-wide transition-colors"
            >
              Home
            </Link>

            {/* Categories Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="flex items-center px-4 py-2 text-sm font-sans font-semibold text-federal-charcoal-700 hover:bg-federal-navy-50 hover:text-federal-navy-900 uppercase tracking-wide transition-colors"
              >
                Data Categories
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoriesOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white border-2 border-federal-navy-900 shadow-brutal p-0 overflow-hidden">
                  <div className="bg-federal-navy-900 text-white p-3">
                    <h3 className="font-serif font-semibold text-sm uppercase tracking-wide">Government Data Sources</h3>
                  </div>
                  <div className="grid gap-0">
                    {categories.map((category, index) => {
                      const Icon = category.icon;
                      return (
                        <Link
                          key={category.name}
                          href={category.href}
                          className="flex items-center p-4 border-b border-federal-charcoal-200 last:border-b-0 hover:bg-federal-red-50 hover:border-l-4 hover:border-l-federal-red-600 transition-all group"
                          onClick={() => setCategoriesOpen(false)}
                        >
                          <div className="w-8 h-8 bg-federal-charcoal-100 group-hover:bg-federal-red-600 border border-federal-charcoal-300 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-4 w-4 text-federal-charcoal-600 group-hover:text-white" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-serif font-semibold text-federal-navy-900 group-hover:text-federal-red-600">{category.name}</p>
                            <p className="text-xs text-federal-charcoal-600 mt-1">{category.description}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/about"
              className="px-4 py-2 text-sm font-sans font-semibold text-federal-charcoal-700 hover:bg-federal-navy-50 hover:text-federal-navy-900 uppercase tracking-wide transition-colors"
            >
              About
            </Link>

            <Link
              href="/pricing"
              className="ml-2 flex items-center gap-2 px-4 py-2 bg-federal-gold-500 text-federal-navy-900 text-sm font-sans font-bold uppercase tracking-wide hover:bg-federal-gold-400 transition-colors shadow-brutal-gold"
            >
              <Crown className="h-4 w-4" />
              Pro
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="w-10 h-10 bg-federal-navy-900 border border-federal-gold-500 flex items-center justify-center text-white hover:bg-federal-red-600 transition-colors"
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

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t-2 border-federal-navy-900 bg-federal-navy-50">
            <div className="py-4 space-y-0">
              <Link
                href="/"
                className="block border-b border-federal-charcoal-200 px-4 py-3 text-sm font-sans font-semibold text-federal-navy-900 hover:bg-federal-red-50 hover:text-federal-red-600 uppercase tracking-wide"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>

              <div className="px-4 py-3 bg-federal-charcoal-100 border-b border-federal-charcoal-200">
                <p className="text-xs font-serif font-semibold text-federal-charcoal-700 uppercase tracking-wider">Data Categories</p>
              </div>

              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="flex items-center border-b border-federal-charcoal-200 px-4 py-3 text-sm font-sans font-semibold text-federal-navy-900 hover:bg-federal-red-50 hover:text-federal-red-600 uppercase tracking-wide"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="w-6 h-6 bg-federal-charcoal-200 border border-federal-charcoal-400 flex items-center justify-center mr-3">
                      <Icon className="h-4 w-4 text-federal-charcoal-600" />
                    </div>
                    {category.name}
                  </Link>
                );
              })}

              <Link
                href="/about"
                className="block border-b border-federal-charcoal-200 px-4 py-3 text-sm font-sans font-semibold text-federal-navy-900 hover:bg-federal-red-50 hover:text-federal-red-600 uppercase tracking-wide"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>

              <Link
                href="/pricing"
                className="flex items-center gap-2 bg-federal-gold-500 px-4 py-3 text-sm font-sans font-bold text-federal-navy-900 hover:bg-federal-gold-400 uppercase tracking-wide"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Crown className="h-4 w-4" />
                Upgrade to Pro
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
