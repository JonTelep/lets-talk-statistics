'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Menu, X, ChevronDown, TrendingUp, Users, DollarSign, 
  Briefcase, Building2, Vote, Database, BarChart3, Calendar,
  Heart, GraduationCap
} from 'lucide-react';

const dataCategories = [
  {
    name: 'Congressional Trading',
    href: '/congress',
    icon: TrendingUp,
    description: 'Real-time stock transactions by members of Congress',
    source: 'STOCK Act',
    subItems: [
      { name: 'Overview', href: '/congress' },
      { name: 'Politicians', href: '/congress/politicians' },
      { name: 'Trades', href: '/congress/trades' },
    ],
  },
  {
    name: 'Immigration Data',
    href: '/immigration',
    icon: Users,
    description: 'DHS migration statistics and border data',
    source: 'DHS',
    subItems: [
      { name: 'Overview', href: '/immigration' },
      { name: 'Trends', href: '/immigration/trends' },
    ],
  },
  {
    name: 'Federal Budget',
    href: '/budget',
    icon: DollarSign,
    description: 'Government spending and fiscal analysis',
    source: 'Treasury',
  },
  {
    name: 'Employment Data',
    href: '/employment',
    icon: Briefcase,
    description: 'Labor statistics and unemployment rates',
    source: 'BLS',
  },
  {
    name: 'National Debt',
    href: '/debt',
    icon: Building2,
    description: 'Federal debt tracking and creditor analysis',
    source: 'Treasury',
  },
  {
    name: 'Election Finance',
    href: '/elections',
    icon: Vote,
    description: 'Campaign finance and public funding data',
    source: 'FEC',
  },
  {
    name: 'Healthcare',
    href: '/healthcare',
    icon: Heart,
    description: 'Healthcare spending, coverage, and outcomes',
    source: 'CMS',
  },
  {
    name: 'Education',
    href: '/education',
    icon: GraduationCap,
    description: 'Education spending, enrollment, and performance',
    source: 'DOE',
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
    <header className="nav-editorial sticky top-0 z-50">
      <nav className="container-editorial" aria-label="Main navigation">
        <div className="flex w-full items-center justify-between py-6">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-4 group">
              <div className="w-10 h-10 bg-editorial-accent flex items-center justify-center group-hover:bg-editorial-dark transition-colors duration-200">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-editorial-dark">
                  Let's Talk Statistics
                </div>
                <div className="text-byline text-editorial-accent">
                  Government Data • Unfiltered
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            <Link href="/" className="nav-link">
              Home
            </Link>

            {/* Data Categories Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="nav-link flex items-center gap-1"
              >
                Data Categories
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoriesOpen && (
                <div className="absolute right-0 mt-2 w-96 card-editorial p-0 shadow-editorial-xl z-50">
                  {/* Header */}
                  <div className="bg-editorial-dark text-white p-4 border-b border-border-light">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5" />
                      <div>
                        <h3 className="font-serif text-lg font-semibold">Data Categories</h3>
                        <p className="text-sm opacity-90">Direct government sources</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Categories list */}
                  <div className="max-h-80 overflow-y-auto">
                    {dataCategories.map((category) => {
                      const Icon = category.icon;
                      
                      return (
                        <Link
                          key={category.name}
                          href={category.href}
                          className="flex items-start p-4 border-b border-border-light last:border-b-0 hover:bg-paper-cream transition-colors group"
                          onClick={() => setCategoriesOpen(false)}
                        >
                          <div className="flex-shrink-0 mr-4">
                            <div className="w-10 h-10 bg-editorial-navy/10 flex items-center justify-center">
                              <Icon className="h-5 w-5 text-editorial-navy" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-serif font-semibold text-editorial-dark group-hover:text-editorial-accent transition-colors">
                                {category.name}
                              </h4>
                              <span className="text-xs px-2 py-0.5 bg-editorial-gold/10 text-editorial-gold font-medium">
                                {category.source}
                              </span>
                            </div>
                            <p className="text-sm text-editorial-gray mb-2">{category.description}</p>
                            
                            {category.subItems && (
                              <div className="flex flex-wrap gap-2">
                                {category.subItems.map((subItem, index) => (
                                  <span key={index} className="text-xs text-editorial-accent">
                                    {subItem.name}
                                    {index < category.subItems!.length - 1 && ' •'}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  
                  {/* Footer */}
                  <div className="bg-paper-cream p-3 border-t border-border-light">
                    <p className="text-xs text-editorial-gray text-center">
                      All data verified against official sources
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Link href="/about" className="nav-link">
              About
            </Link>

            {/* Date display */}
            <div className="flex items-center gap-2 text-sm text-editorial-gray border-l border-border-light pl-8">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="w-10 h-10 bg-editorial-accent hover:bg-editorial-dark transition-colors duration-200 flex items-center justify-center text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Toggle menu</span>
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border-light bg-white">
            <div className="py-4 space-y-1">
              {/* Home */}
              <Link
                href="/"
                className="block px-4 py-3 text-editorial-gray hover:text-editorial-dark hover:bg-paper-cream transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>

              {/* Categories header */}
              <div className="px-4 py-2 bg-paper-cream border-y border-border-light">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-editorial-accent" />
                  <span className="text-byline text-editorial-accent">Data Categories</span>
                </div>
              </div>

              {/* Categories */}
              {dataCategories.map((category) => {
                const Icon = category.icon;
                
                return (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="flex items-center gap-3 px-4 py-3 text-editorial-gray hover:text-editorial-dark hover:bg-paper-cream transition-colors group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="w-8 h-8 bg-editorial-navy/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-editorial-navy" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-editorial-accent">{category.source}</div>
                    </div>
                  </Link>
                );
              })}

              {/* About */}
              <Link
                href="/about"
                className="block px-4 py-3 text-editorial-gray hover:text-editorial-dark hover:bg-paper-cream transition-colors border-t border-border-light"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
            </div>
            
            {/* Status footer */}
            <div className="border-t border-border-light bg-paper-cream px-4 py-3">
              <div className="flex items-center justify-between text-xs text-editorial-gray">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-editorial-forest rounded-full"></div>
                  <span>Data feeds active</span>
                </div>
                <span>
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}