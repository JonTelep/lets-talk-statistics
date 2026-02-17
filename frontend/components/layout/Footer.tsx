import Link from 'next/link';
import { AlertTriangle, Github, Twitter, ExternalLink } from 'lucide-react';

const dataCategories = [
  { name: 'Congress', href: '/congress' },
  { name: 'Immigration', href: '/immigration' },
  { name: 'Budget', href: '/budget' },
  { name: 'Employment', href: '/employment' },
  { name: 'Debt', href: '/debt' },
  { name: 'Elections', href: '/elections' },
];

const officialSources = [
  { name: 'U.S. Treasury', href: 'https://treasury.gov' },
  { name: 'Department of Homeland Security', href: 'https://dhs.gov' },
  { name: 'Bureau of Labor Statistics', href: 'https://bls.gov' },
  { name: 'Office of Management & Budget', href: 'https://omb.gov' },
  { name: 'Federal Election Commission', href: 'https://fec.gov' },
];

const systemInfo = [
  { label: 'BUILD', value: 'v2.1.0' },
  { label: 'LAST_UPDATE', value: '2024-02-17' },
  { label: 'STATUS', value: 'OPERATIONAL' },
  { label: 'UPTIME', value: '99.9%' },
];

export default function Footer() {
  return (
    <footer className="border-t-4 border-accent bg-surface">
      {/* SYSTEM STATUS BAR */}
      <div className="border-b-2 border-surface-800 bg-surface-950 px-4 sm:px-6 lg:px-8 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-6">
              {systemInfo.map((info) => (
                <div key={info.label} className="flex items-center gap-2">
                  <span className="text-surface-500">{info.label}:</span>
                  <span className={info.label === 'STATUS' ? 'text-green-500' : 'text-text-primary'}>
                    {info.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-green-500">
              <div className="w-2 h-2 bg-green-500 animate-pulse"></div>
              <span>LIVE DATA STREAM</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-7xl">
          {/* MAIN FOOTER GRID */}
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            
            {/* BRAND TERMINAL */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 border-2 border-accent bg-accent flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-surface" />
                </div>
                <div className="flex flex-col">
                  <span className="text-brutal text-sm text-text-primary leading-none">
                    LET'S TALK
                  </span>
                  <span className="text-brutal text-xs text-accent leading-none">
                    STATISTICS
                  </span>
                </div>
              </div>
              <div className="font-mono text-xs text-surface-400 mb-6 leading-relaxed">
                OBJECTIVE ANALYSIS OF U.S. GOVERNMENT STATISTICS FROM OFFICIAL SOURCES.
                NO OPINIONS. NO NARRATIVES. JUST DATA.
              </div>
              <div className="text-xs font-mono text-surface-500">
                $ system_mission: "TRANSPARENCY THROUGH DATA"
              </div>
            </div>

            {/* DATA CATEGORIES */}
            <div>
              <h3 className="text-brutal text-sm text-text-primary mb-6">DATA STREAMS</h3>
              <nav className="space-y-2">
                {dataCategories.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="block text-xs font-mono text-surface-400 hover:text-accent transition-colors py-1 border-l-2 border-transparent hover:border-accent pl-3"
                  >
                    {category.name.toUpperCase()}
                  </Link>
                ))}
              </nav>
            </div>

            {/* OFFICIAL SOURCES */}
            <div>
              <h3 className="text-brutal text-sm text-text-primary mb-6">VERIFIED SOURCES</h3>
              <nav className="space-y-2">
                {officialSources.map((source) => (
                  <a
                    key={source.name}
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-xs font-mono text-surface-400 hover:text-accent transition-colors py-1"
                  >
                    <span>{source.name.toUpperCase()}</span>
                    <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                  </a>
                ))}
              </nav>
            </div>

            {/* SYSTEM INFO */}
            <div>
              <h3 className="text-brutal text-sm text-text-primary mb-6">SYSTEM INFO</h3>
              <div className="space-y-3">
                <Link
                  href="/about"
                  className="block text-xs font-mono text-surface-400 hover:text-accent transition-colors py-1"
                >
                  METHODOLOGY
                </Link>
                <a
                  href="https://github.com/JonTelep/lets-talk-statistics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-xs font-mono text-surface-400 hover:text-accent transition-colors py-1"
                >
                  <Github className="h-3 w-3" />
                  SOURCE CODE
                </a>
                <a
                  href="https://twitter.com/telep_io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-xs font-mono text-surface-400 hover:text-accent transition-colors py-1"
                >
                  <Twitter className="h-3 w-3" />
                  UPDATES
                </a>
              </div>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="divider-brutal mb-12"></div>

          {/* BOTTOM SECTION - TERMINAL OUTPUT */}
          <div className="bg-surface-900 border-2 border-surface-700 p-6">
            <div className="font-mono text-xs">
              <div className="text-accent mb-2">$ legal --disclaimer</div>
              <div className="text-surface-400 mb-4 leading-relaxed">
                ALL DATA SOURCED FROM OFFICIAL U.S. GOVERNMENT AGENCIES. THIS SITE PROVIDES RAW STATISTICS 
                AND DOES NOT CONSTITUTE FINANCIAL, LEGAL, OR POLITICAL ADVICE. VERIFY ALL INFORMATION 
                INDEPENDENTLY. BUILT WITH TRANSPARENCY BY{' '}
                <a 
                  href="https://telep.io" 
                  className="text-text-primary hover:text-accent border-b border-current transition-colors"
                >
                  TELEP IO
                </a>
                .
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 text-surface-500">
                <div>© 2024 LET'S TALK STATISTICS. OPEN SOURCE.</div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 animate-pulse"></div>
                  <span>SYSTEM OPERATIONAL</span>
                </div>
              </div>
              <div className="text-green-500 mt-2 animate-pulse">_</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}