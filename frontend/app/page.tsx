import Link from 'next/link';
import { ArrowRight, TrendingUp, Users, DollarSign, Briefcase, Building2, Vote, AlertTriangle } from 'lucide-react';

const categories = [
  {
    name: 'CONGRESSIONAL TRADING',
    description: 'STOCK TRADES BY MEMBERS OF CONGRESS UNDER STOCK ACT DISCLOSURES.',
    href: '/congress',
    icon: TrendingUp,
    stat: '435+ MEMBERS TRACKED',
    severity: 'HIGH',
  },
  {
    name: 'IMMIGRATION',
    description: 'LEGAL IMMIGRATION, DEPORTATIONS, AND BORDER ENCOUNTER STATISTICS.',
    href: '/immigration',
    icon: Users,
    stat: 'DHS & CBP DATA',
    severity: 'ACTIVE',
  },
  {
    name: 'FEDERAL BUDGET',
    description: 'GOVERNMENT SPENDING, REVENUE, AND DEFICIT TRACKING BY AGENCY.',
    href: '/budget',
    icon: DollarSign,
    stat: 'TREASURY DATA',
    severity: 'CRITICAL',
  },
  {
    name: 'EMPLOYMENT',
    description: 'UNEMPLOYMENT RATES, JOB GROWTH, AND LABOR FORCE STATISTICS.',
    href: '/employment',
    icon: Briefcase,
    stat: 'BLS MONTHLY DATA',
    severity: 'TRACKED',
  },
  {
    name: 'NATIONAL DEBT',
    description: 'FEDERAL DEBT TRACKING, WHO HOLDS OUR DEBT, AND HISTORICAL GROWTH.',
    href: '/debt',
    icon: Building2,
    stat: 'REAL-TIME TREASURY',
    severity: 'URGENT',
  },
  {
    name: 'ELECTION FUNDING',
    description: 'CAMPAIGN FINANCE, BALLOT ACCESS BARRIERS, AND THE TWO-PARTY SYSTEM.',
    href: '/elections',
    icon: Vote,
    stat: 'FEC DATA',
    severity: 'ACTIVE',
  },
];

const principles = [
  {
    id: '01',
    title: 'DATA FIRST',
    description: 'RAW NUMBERS FROM OFFICIAL GOVERNMENT SOURCES. NO CHERRY-PICKING, NO SELECTIVE FRAMING.',
  },
  {
    id: '02', 
    title: 'UNBIASED',
    description: 'ZERO EDITORIALIZING. WE PRESENT FINDINGS AND LET YOU FORM YOUR OWN CONCLUSIONS.',
  },
  {
    id: '03',
    title: 'TRANSPARENT',
    description: 'EVERY STATISTIC LINKS TO ITS SOURCE. FULL METHODOLOGY DISCLOSED. VERIFY EVERYTHING.',
  },
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'CRITICAL': return 'text-red-500';
    case 'URGENT': return 'text-red-400';
    case 'HIGH': return 'text-orange-500';
    case 'ACTIVE': return 'text-yellow-500';
    case 'TRACKED': return 'text-green-500';
    default: return 'text-surface-400';
  }
};

export default function Home() {
  return (
    <div className="flex flex-col bg-surface">
      {/* BRUTAL HERO */}
      <section className="px-4 sm:px-6 lg:px-8 pt-32 pb-24 bg-grid relative">
        <div className="absolute inset-0 bg-surface/90"></div>
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 mb-6">
              <AlertTriangle className="h-6 w-6 text-accent" />
              <span className="text-brutal text-accent text-sm">UNFILTERED DATA STREAM</span>
            </div>
          </div>
          
          <h1 className="text-brutal mb-8 leading-none">
            GOVERNMENT DATA,
            <br />
            <span className="text-accent">WITHOUT THE SPIN.</span>
          </h1>
          
          <div className="divider-brutal mb-8"></div>
          
          <p className="text-lg text-secondary max-w-3xl mb-12 leading-tight font-mono">
            OBJECTIVE ANALYSIS OF U.S. GOVERNMENT STATISTICS FROM OFFICIAL SOURCES.
            <br />
            NO OPINIONS. NO NARRATIVES. JUST DATA — EXPLORE THE NUMBERS AND DRAW YOUR OWN CONCLUSIONS.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link href="/debt" className="btn-primary">
              ACCESS DATA STREAM
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/about" className="btn-secondary">
              VERIFY METHODOLOGY
            </Link>
          </div>
        </div>
        
        {/* Geometric accent elements */}
        <div className="absolute top-20 right-8 w-32 h-32 border-4 border-accent opacity-20"></div>
        <div className="absolute bottom-20 left-8 w-24 h-24 border-2 border-text-primary opacity-10"></div>
      </section>

      {/* DATA CATEGORIES GRID */}
      <section className="px-4 sm:px-6 lg:px-8 py-24 bg-surface-950">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 border-l-4 border-accent pl-6">
            <h2 className="text-brutal mb-4">DATA CATEGORIES</h2>
            <p className="text-data text-surface-400 font-mono text-sm">
              EACH CATEGORY PULLS DIRECTLY FROM OFFICIAL U.S. GOVERNMENT DATA SOURCES.
            </p>
          </div>

          <div className="data-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.name} href={category.href} className="group">
                  <div className="data-cell group-hover:bg-surface-900 p-8 relative">
                    {/* Severity indicator */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Icon className="h-6 w-6 text-accent" />
                        <span className={`text-xs font-mono font-bold ${getSeverityColor(category.severity)}`}>
                          [{category.severity}]
                        </span>
                      </div>
                      <ArrowRight className="h-5 w-5 text-surface-600 group-hover:text-accent group-hover:translate-x-1" />
                    </div>
                    
                    <h3 className="text-brutal text-sm mb-4 text-text-primary">
                      {category.name}
                    </h3>
                    
                    <p className="text-xs text-surface-400 mb-6 leading-relaxed font-mono">
                      {category.description}
                    </p>
                    
                    <div className="border-t border-surface-700 pt-4">
                      <p className="text-xs text-accent font-mono font-bold">
                        {category.stat}
                      </p>
                    </div>
                    
                    {/* Hover state accent */}
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent pointer-events-none"></div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRINCIPLES - STARK PRESENTATION */}
      <section className="border-t-4 border-text-primary px-4 sm:px-6 lg:px-8 py-24 bg-surface">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-brutal mb-6">OPERATIONAL PRINCIPLES</h2>
            <div className="w-32 h-1 bg-accent mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {principles.map((principle) => (
              <div key={principle.id} className="relative">
                <div className="card-brutal p-8 h-full">
                  <div className="mb-6">
                    <span className="text-accent text-3xl font-mono font-bold">{principle.id}</span>
                  </div>
                  <h3 className="text-brutal text-lg mb-4 text-text-primary">{principle.title}</h3>
                  <p className="text-sm text-surface-300 font-mono leading-relaxed">
                    {principle.description}
                  </p>
                  
                  {/* Geometric accent */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 border-2 border-accent bg-surface"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SYSTEM STATUS */}
      <section className="border-t-2 border-surface-800 px-4 sm:px-6 lg:px-8 py-16 bg-surface-950">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="border border-surface-700 p-6">
              <div className="text-2xl font-mono font-bold text-accent mb-2">100%</div>
              <div className="text-xs font-mono text-surface-400 uppercase tracking-wider">UPTIME</div>
            </div>
            <div className="border border-surface-700 p-6">
              <div className="text-2xl font-mono font-bold text-green-500 mb-2">LIVE</div>
              <div className="text-xs font-mono text-surface-400 uppercase tracking-wider">DATA FEEDS</div>
            </div>
            <div className="border border-surface-700 p-6">
              <div className="text-2xl font-mono font-bold text-text-primary mb-2">6</div>
              <div className="text-xs font-mono text-surface-400 uppercase tracking-wider">AGENCIES</div>
            </div>
            <div className="border border-surface-700 p-6">
              <div className="text-2xl font-mono font-bold text-yellow-500 mb-2">24/7</div>
              <div className="text-xs font-mono text-surface-400 uppercase tracking-wider">MONITORING</div>
            </div>
          </div>
        </div>
      </section>

      {/* SOURCE ATTRIBUTION - TERMINAL STYLE */}
      <section className="border-t-4 border-accent px-4 sm:px-6 lg:px-8 py-12 bg-surface">
        <div className="mx-auto max-w-6xl">
          <div className="font-mono text-sm">
            <div className="text-accent mb-2">$ data_sources --list</div>
            <div className="text-surface-400 pl-4 mb-4">
              ALL DATA SOURCED FROM U.S. TREASURY, DHS, BLS, OMB, AND FEC.
              <br />
              BUILT BY{' '}
              <a href="https://telep.io" className="text-text-primary hover:text-accent border-b border-current">
                TELEP IO
              </a>
              .
            </div>
            <div className="text-green-500">$ connection_status: ACTIVE</div>
            <div className="text-green-500 animate-pulse">_</div>
          </div>
        </div>
      </section>
    </div>
  );
}