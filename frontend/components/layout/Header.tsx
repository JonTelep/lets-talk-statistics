'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, BarChart3, ChevronDown, TrendingUp, Users, DollarSign, Briefcase, Building2 } from 'lucide-react';

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
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between border-b border-gray-200 py-4 lg:border-none">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">
                Let's Talk Statistics
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            <Link
              href="/"
              className="text-base font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              Home
            </Link>

            {/* Categories Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="flex items-center text-base font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                Categories
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoriesOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 p-4">
                  <div className="grid gap-3">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <Link
                          key={category.name}
                          href={category.href}
                          className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors"
                          onClick={() => setCategoriesOpen(false)}
                        >
                          <Icon className="h-6 w-6 text-primary-600 flex-shrink-0" />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{category.name}</p>
                            <p className="text-xs text-gray-500">{category.description}</p>
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
              className="text-base font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              About
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-primary-600"
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
          <div className="lg:hidden py-4 space-y-1">
            <Link
              href="/"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>

            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Categories</p>
            </div>

            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.name}
                  href={category.href}
                  className="flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-2 text-primary-600" />
                  {category.name}
                </Link>
              );
            })}

            <Link
              href="/about"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
