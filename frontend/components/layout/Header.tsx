'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Menu, X, Satellite, ChevronDown, TrendingUp, Users, DollarSign, 
  Briefcase, Building2, Vote, Terminal, Activity, Zap, Database
} from 'lucide-react';

const missionModules = [
  {
    name: 'CONGRESSIONAL TRADING',
    designation: 'CT-001',
    href: '/congress',
    icon: TrendingUp,
    description: 'Real-time stock transactions by legislative personnel',
    priority: 'critical',
    subItems: [
      { name: 'Mission Overview', href: '/congress' },
      { name: 'Personnel Tracking', href: '/congress/politicians' },
      { name: 'Transaction Log', href: '/congress/trades' },
    ],
  },
  {
    name: 'IMMIGRATION TRACKING',
    designation: 'IT-002',
    href: '/immigration',
    icon: Users,
    description: 'DHS data stream analysis and border metrics',
    priority: 'standard',
    subItems: [
      { name: 'Mission Overview', href: '/immigration' },
      { name: 'Trend Analysis', href: '/immigration/trends' },
    ],
  },
  {
    name: 'FEDERAL BUDGET',
    designation: 'FB-003',
    href: '/budget',
    icon: DollarSign,
    description: 'USASpending.gov expenditure tracking',
    priority: 'critical',
    subItems: [
      { name: 'Mission Overview', href: '/budget' },
      { name: 'Agency Breakdown', href: '/budget/agencies' },
    ],
  },
  {
    name: 'EMPLOYMENT METRICS',
    designation: 'EM-004',
    href: '/employment',
    icon: Briefcase,
    description: 'Bureau of Labor Statistics pipeline',
    priority: 'standard',
    subItems: [
      { name: 'Mission Overview', href: '/employment' },
      { name: 'Regional Analysis', href: '/employment/states' },
    ],
  },
  {
    name: 'NATIONAL DEBT',
    designation: 'ND-005',
    href: '/debt',
    icon: Building2,
    description: 'Treasury fiscal data and debt tracking',
    priority: 'critical',
    subItems: [
      { name: 'Mission Overview', href: '/debt' },
      { name: 'Historical Data', href: '/debt/historical' },
    ],
  },
  {
    name: 'ELECTION FUNDING',
    designation: 'EF-006',
    href: '/elections',
    icon: Vote,
    description: 'FEC database analysis and campaign finance',
    priority: 'standard',
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
    <header className="bg-steel-gray-900 border-b-2 border-neon-cyan-400 sticky top-0 z-50 relative">
      {/* Scanner line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-neon-cyan-400 animate-data-flow"></div>
      
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative" aria-label="Mission Control Navigation">
        <div className="flex w-full items-center justify-between py-4">
          {/* Mission Control Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="w-12 h-12 bg-neon-cyan-400 border-2 border-cyber-orange-400 flex items-center justify-center group-hover:bg-cyber-orange-400 transition-all duration-300 relative">
                  <Satellite className="h-7 w-7 text-space-navy-950 group-hover:rotate-12 transition-transform duration-300" />
                  <div className="absolute inset-0 border border-neon-cyan-600 animate-mission-pulse"></div>
                </div>
                {/* Status indicator */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-radar-green-400 rounded-full animate-status-blink shadow-neon-green"></div>
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-xl font-bold text-white leading-none tracking-wide">
                    LET'S TALK
                  </span>
                  <Terminal className="h-4 w-4 text-neon-cyan-400" />
                </div>
                <span className="block mission-text text-sm leading-none">
                  STATISTICS
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Mission Control Panel */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-neon-cyan-200 hover:bg-neon-cyan-400 hover:text-space-navy-950 transition-all duration-200 relative group"
            >
              <Activity className="h-4 w-4" />
              <span className="terminal-text">HOME</span>
            </Link>

            {/* Mission Modules Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-neon-cyan-200 hover:bg-neon-cyan-400 hover:text-space-navy-950 transition-all duration-200 group"
              >
                <Database className="h-4 w-4" />
                <span className="terminal-text">MISSIONS</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoriesOpen && (
                <div className="absolute right-0 mt-2 w-[500px] panel-nasa p-0 overflow-hidden z-50">
                  {/* Header */}
                  <div className="bg-neon-cyan-400 text-space-navy-950 p-4 border-b border-steel-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-space-navy-950 flex items-center justify-center">
                        <Database className="h-5 w-5 text-neon-cyan-400" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg uppercase">MISSION MODULES</h3>
                        <p className="text-xs font-mono opacity-80">GOVERNMENT_DATA_STREAMS</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mission list */}
                  <div className="max-h-80 overflow-y-auto">
                    {missionModules.map((mission, index) => {
                      const Icon = mission.icon;
                      const isCritical = mission.priority === 'critical';
                      
                      return (
                        <Link
                          key={mission.name}
                          href={mission.href}
                          className="flex items-center p-4 border-b border-steel-gray-700 last:border-b-0 hover:bg-steel-gray-800 transition-all group relative"
                          onClick={() => setCategoriesOpen(false)}
                        >
                          {/* Priority indicator */}
                          <div className="flex-shrink-0 mr-4">
                            <div className={`w-10 h-10 border-2 flex items-center justify-center relative ${
                              isCritical 
                                ? 'bg-cyber-orange-400 border-cyber-orange-600 text-space-navy-950' 
                                : 'bg-neon-cyan-400 border-neon-cyan-600 text-space-navy-950'
                            }`}>
                              <Icon className="h-5 w-5" />
                              {isCritical && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyber-orange-600 rounded-full"></div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="heading-section text-sm group-hover:text-cyber-orange-400 transition-colors">
                                {mission.name}
                              </p>
                              <span className="terminal-text text-xs opacity-60">
                                {mission.designation}
                              </span>
                            </div>
                            <p className="text-xs text-neon-cyan-300 mb-2">{mission.description}</p>
                            
                            {/* Sub-items if available */}
                            {mission.subItems && (
                              <div className="flex gap-2 mt-2">
                                {mission.subItems.map((subItem, subIndex) => (
                                  <span key={subIndex} className="text-xs terminal-text opacity-50">
                                    {subItem.name}
                                    {subIndex < mission.subItems!.length - 1 && ' •'}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Status indicator */}
                          <div className="flex-shrink-0 ml-3">
                            <div className="w-2 h-2 bg-radar-green-400 rounded-full animate-status-blink"></div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  
                  {/* Footer */}
                  <div className="bg-steel-gray-800 p-3 border-t border-steel-gray-700">
                    <p className="terminal-text text-xs text-center">
                      ALL_SYSTEMS_OPERATIONAL • DATA_FEEDS_ACTIVE
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/about"
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-neon-cyan-200 hover:bg-neon-cyan-400 hover:text-space-navy-950 transition-all duration-200 group"
            >
              <Terminal className="h-4 w-4" />
              <span className="terminal-text">ABOUT</span>
            </Link>
          </div>

          {/* Mobile menu control */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="w-12 h-12 bg-neon-cyan-400 border-2 border-cyber-orange-400 flex items-center justify-center text-space-navy-950 hover:bg-cyber-orange-400 transition-all duration-300 relative"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Toggle mission control menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
              <div className="absolute inset-0 border border-neon-cyan-600 animate-border-scan"></div>
            </button>
          </div>
        </div>

        {/* Mobile Mission Control Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t-2 border-neon-cyan-400 bg-steel-gray-900 relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-neon-cyan-400 animate-data-flow"></div>
            
            <div className="py-4 space-y-0">
              {/* Home */}
              <Link
                href="/"
                className="flex items-center gap-3 border-b border-steel-gray-700 px-4 py-4 text-sm font-medium text-neon-cyan-200 hover:bg-steel-gray-800 hover:text-cyber-orange-400 transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Activity className="h-5 w-5" />
                <span className="terminal-text">HOME</span>
              </Link>

              {/* Mission modules header */}
              <div className="px-4 py-3 bg-steel-gray-800 border-b border-steel-gray-700">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-neon-cyan-400" />
                  <p className="mission-text text-sm">MISSION MODULES</p>
                </div>
              </div>

              {/* Mission modules */}
              {missionModules.map((mission, index) => {
                const Icon = mission.icon;
                const isCritical = mission.priority === 'critical';
                
                return (
                  <Link
                    key={mission.name}
                    href={mission.href}
                    className="flex items-center gap-3 border-b border-steel-gray-700 px-4 py-4 text-sm font-medium text-neon-cyan-200 hover:bg-steel-gray-800 hover:text-cyber-orange-400 transition-all group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className={`w-8 h-8 border flex items-center justify-center flex-shrink-0 ${
                      isCritical 
                        ? 'bg-cyber-orange-400 border-cyber-orange-600 text-space-navy-950' 
                        : 'bg-neon-cyan-400 border-neon-cyan-600 text-space-navy-950'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="terminal-text">{mission.name}</div>
                      <div className="text-xs text-neon-cyan-400 mt-1">{mission.designation}</div>
                    </div>
                    {isCritical && (
                      <Zap className="h-4 w-4 text-cyber-orange-400" />
                    )}
                  </Link>
                );
              })}

              {/* About */}
              <Link
                href="/about"
                className="flex items-center gap-3 px-4 py-4 text-sm font-medium text-neon-cyan-200 hover:bg-steel-gray-800 hover:text-cyber-orange-400 transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Terminal className="h-5 w-5" />
                <span className="terminal-text">ABOUT</span>
              </Link>
            </div>
            
            {/* Status footer */}
            <div className="border-t border-neon-cyan-400 bg-steel-gray-800 px-4 py-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-radar-green-400 rounded-full animate-status-blink"></div>
                  <span className="terminal-text">SYSTEM_OPERATIONAL</span>
                </div>
                <span className="terminal-text opacity-60">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}