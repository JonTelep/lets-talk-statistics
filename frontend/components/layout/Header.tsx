'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Menu, X, ChevronDown, TrendingUp, Users, DollarSign, 
  Briefcase, Building2, Vote, Database, BarChart3, Calendar,
  Heart, GraduationCap, Radio, Satellite, Monitor
} from 'lucide-react';

const missionModules = [
  {
    name: 'Congressional Trading Protocol',
    href: '/congress',
    icon: TrendingUp,
    description: 'Real-time political entity transaction monitoring',
    source: 'STOCK-NET',
    status: 'CRITICAL',
    subItems: [
      { name: 'Overview', href: '/congress' },
      { name: 'Politicians', href: '/congress/politicians' },
      { name: 'Trades', href: '/congress/trades' },
    ],
  },
  {
    name: 'Immigration Data Matrix',
    href: '/immigration',
    icon: Users,
    description: 'DHS migration analysis and border intelligence',
    source: 'DHS-NET',
    status: 'OPERATIONAL',
    subItems: [
      { name: 'Overview', href: '/immigration' },
      { name: 'Trends', href: '/immigration/trends' },
    ],
  },
  {
    name: 'Federal Budget Grid',
    href: '/budget',
    icon: DollarSign,
    description: 'Government expenditure and fiscal monitoring',
    source: 'TREASURY-LINK',
    status: 'OPERATIONAL',
  },
  {
    name: 'Employment Statistics',
    href: '/employment',
    icon: Briefcase,
    description: 'Labor data analysis and unemployment tracking',
    source: 'BLS-CORE',
    status: 'OPERATIONAL',
  },
  {
    name: 'National Debt Monitor',
    href: '/debt',
    icon: Building2,
    description: 'Federal debt tracking and creditor analysis',
    source: 'TREASURY-MAIN',
    status: 'WARNING',
  },
  {
    name: 'Electoral Finance Tracker',
    href: '/elections',
    icon: Vote,
    description: 'Campaign finance and funding analysis protocols',
    source: 'FEC-MAIN',
    status: 'OPERATIONAL',
  },
  {
    name: 'Healthcare Grid',
    href: '/healthcare',
    icon: Heart,
    description: 'Medical expenditure, coverage and outcomes data',
    source: 'CMS-NET',
    status: 'OPERATIONAL',
  },
  {
    name: 'Education Matrix',
    href: '/education',
    icon: GraduationCap,
    description: 'Educational spending, enrollment and performance',
    source: 'DOE-CORE',
    status: 'OPERATIONAL',
  },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modulesOpen, setModulesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setModulesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return 'status-critical';
      case 'WARNING':
        return 'status-warning';
      case 'OPERATIONAL':
      default:
        return 'status-online';
    }
  };

  return (
    <header className="nav-mission-control sticky top-0 z-50">
      <nav className="container-command" aria-label="Mission Control Navigation">
        <div className="flex w-full items-center justify-between py-4">
          {/* Mission Control Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-4 group hover-lift-tech">
              <div className="w-12 h-12 bg-electric-green/20 border-2 border-electric-green flex items-center justify-center relative overflow-hidden group-hover:bg-electric-green/30 transition-all duration-300">
                <Database className="h-7 w-7 text-electric-green animate-pulse-glow" />
                <div className="absolute inset-0 bg-electric-green/10 animate-scanner-sweep opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div>
                <div className="font-orbitron text-2xl font-bold text-star-white group-hover:text-electric-green transition-colors">
                  MISSION CONTROL
                </div>
                <div className="text-mission-control text-xs">
                  DATA SYSTEMS • REAL-TIME
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Mission Interface */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            <Link href="/" className="nav-link-tech">
              HOME BASE
            </Link>

            {/* System Modules Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setModulesOpen(!modulesOpen)}
                className="nav-link-tech flex items-center gap-1"
              >
                SYSTEM MODULES
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${modulesOpen ? 'rotate-180' : ''}`} />
              </button>

              {modulesOpen && (
                <div className="absolute right-0 mt-2 w-[32rem] card-hologram p-0 shadow-xl z-50 border border-electric-green/30">
                  {/* Header */}
                  <div className="bg-panel-dark border-b border-electric-green/20 p-4">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-5 w-5 text-electric-green animate-pulse-glow" />
                      <div>
                        <h3 className="font-orbitron text-lg font-bold text-star-white">System Modules</h3>
                        <p className="text-sm text-steel-gray font-exo">Federal data network interfaces</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Modules list */}
                  <div className="max-h-80 overflow-y-auto">
                    {missionModules.map((module) => {
                      const Icon = module.icon;
                      
                      return (
                        <Link
                          key={module.name}
                          href={module.href}
                          className="flex items-start p-4 border-b border-electric-green/10 last:border-b-0 hover:bg-electric-green/5 transition-colors group"
                          onClick={() => setModulesOpen(false)}
                        >
                          <div className="flex-shrink-0 mr-4">
                            <div className="w-10 h-10 bg-electric-green/10 border border-electric-green/30 flex items-center justify-center">
                              <Icon className="h-5 w-5 text-electric-green" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-exo font-semibold text-star-white group-hover:text-electric-green transition-colors">
                                {module.name}
                              </h4>
                              <span className="text-xs px-2 py-0.5 bg-electric-green/10 text-electric-green font-jetbrains">
                                {module.source}
                              </span>
                              <span className={`text-xs font-jetbrains ${getStatusColor(module.status)}`}>
                                {module.status}
                              </span>
                            </div>
                            <p className="text-sm text-gunmetal mb-2 font-space-mono">{module.description}</p>
                            
                            {module.subItems && (
                              <div className="flex flex-wrap gap-2">
                                {module.subItems.map((subItem, index) => (
                                  <span key={index} className="text-xs text-electric-green font-jetbrains">
                                    {subItem.name}
                                    {index < module.subItems!.length - 1 && ' •'}
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
                  <div className="bg-electric-green/5 p-3 border-t border-electric-green/20">
                    <p className="text-xs text-steel-gray text-center font-jetbrains">
                      ALL DATA VERIFIED • FEDERAL NETWORK CONNECTIONS
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Link href="/about" className="nav-link-tech">
              MISSION INFO
            </Link>

            {/* System Status Display */}
            <div className="flex items-center gap-2 text-sm border-l border-electric-green/20 pl-6">
              <Radio className="h-4 w-4 text-electric-green animate-pulse-glow" />
              <div className="font-jetbrains">
                <div className="status-online text-xs">ALL SYSTEMS</div>
                <div className="text-xs text-gunmetal">
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  }).toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Interface Control */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="w-10 h-10 bg-electric-green/20 border border-electric-green/50 hover:bg-electric-green/30 transition-all duration-200 flex items-center justify-center text-electric-green"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Toggle mission interface</span>
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Mission Interface */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-electric-green/20 bg-panel-dark">
            <div className="py-4 space-y-1">
              {/* Home */}
              <Link
                href="/"
                className="block px-4 py-3 text-steel-gray hover:text-electric-green hover:bg-electric-green/5 transition-colors font-exo"
                onClick={() => setMobileMenuOpen(false)}
              >
                HOME BASE
              </Link>

              {/* Modules header */}
              <div className="px-4 py-2 bg-electric-green/5 border-y border-electric-green/20">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-electric-green" />
                  <span className="text-mission-control">SYSTEM MODULES</span>
                </div>
              </div>

              {/* Modules */}
              {missionModules.map((module) => {
                const Icon = module.icon;
                
                return (
                  <Link
                    key={module.name}
                    href={module.href}
                    className="flex items-center gap-3 px-4 py-3 text-steel-gray hover:text-electric-green hover:bg-electric-green/5 transition-colors group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="w-8 h-8 bg-electric-green/10 border border-electric-green/30 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-electric-green" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium font-exo">{module.name}</div>
                      <div className="text-sm font-jetbrains flex items-center gap-2">
                        <span className="text-electric-green">{module.source}</span>
                        <span className={`text-xs ${getStatusColor(module.status)}`}>
                          {module.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* About */}
              <Link
                href="/about"
                className="block px-4 py-3 text-steel-gray hover:text-electric-green hover:bg-electric-green/5 transition-colors border-t border-electric-green/20 font-exo"
                onClick={() => setMobileMenuOpen(false)}
              >
                MISSION INFO
              </Link>
            </div>
            
            {/* Status footer */}
            <div className="border-t border-electric-green/20 bg-electric-green/5 px-4 py-3">
              <div className="flex items-center justify-between text-xs font-jetbrains">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-electric-green rounded-full animate-pulse-glow"></div>
                  <span className="text-electric-green">NETWORK ACTIVE</span>
                </div>
                <span className="text-steel-gray">
                  {new Date().toLocaleDateString().toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}