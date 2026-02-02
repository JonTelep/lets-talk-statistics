import Link from 'next/link';
import { Terminal, TrendingUp, Users, DollarSign, Briefcase, Building2, ChevronRight, Vote, Activity } from 'lucide-react';

const categories = [
  {
    name: 'CONGRESS_TRADES',
    description: 'STOCK Act disclosures >> congressional portfolio tracking',
    href: '/congress',
    icon: TrendingUp,
    color: 'terminal-cyan',
    glowColor: 'glow-cyan',
    stats: '[435] members | [real-time] trades | [performance] tracking',
    status: 'ACTIVE',
  },
  {
    name: 'IMMIGRATION_SYS',
    description: 'DHS data stream >> border encounters + legal status',
    href: '/immigration',
    icon: Users,
    color: 'terminal-green',
    glowColor: 'glow-green',
    stats: '[dhs.gov] source | [historical] trends | [country] breakdown',
    status: 'LIVE',
  },
  {
    name: 'BUDGET_FLOW',
    description: 'Treasury expenditure matrix >> agency spending analysis',
    href: '/budget',
    icon: DollarSign,
    color: 'terminal-amber',
    glowColor: 'glow-amber',
    stats: '[treasury.gov] feed | [agency] breakdown | [historical] data',
    status: 'SYNC',
  },
  {
    name: 'LABOR_METRICS',
    description: 'BLS employment algorithms >> unemployment rate analysis',
    href: '/employment',
    icon: Briefcase,
    color: 'terminal-cyan',
    glowColor: 'glow-cyan',
    stats: '[bls.gov] api | [state] rankings | [monthly] updates',
    status: 'ACTIVE',
  },
  {
    name: 'DEBT_MONITOR',
    description: 'Federal deficit tracking >> real-time debt calculations',
    href: '/debt',
    icon: Building2,
    color: 'terminal-red',
    glowColor: 'text-terminal-red',
    stats: '[treasury] live | [real-time] data | [debt] holders',
    status: 'CRITICAL',
  },
  {
    name: 'ELECTION_MATRIX',
    description: 'FEC campaign finance >> two-party system analysis',
    href: '/elections',
    icon: Vote,
    color: 'terminal-purple',
    glowColor: 'text-terminal-purple',
    stats: '[fec.gov] data | [public] funding | [ballot] access',
    status: 'MONITORED',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Terminal Header */}
      <section className="border-b border-terminal-border bg-terminal-surface">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="font-mono text-sm text-terminal-muted">
            <span className="text-terminal-cyan">user@gov-data:~$</span>{' '}
            <span className="text-terminal-text">./statistics --mode=visual --source=government</span>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-terminal-bg via-terminal-surface to-terminal-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-terminal bg-grid-20 opacity-30"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Terminal className="h-20 w-20 text-terminal-cyan glow-cyan animate-pulse" />
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-mono font-bold tracking-tight mb-6 glow-cyan">
              gov-statistics.exe
            </h1>
            <div className="font-mono text-terminal-amber mb-8">
              <p className="text-xl mb-2">[SYSTEM] Data pipeline initialized</p>
              <p className="text-lg text-terminal-muted">
                >> Raw government feeds | No preprocessing | Direct from source
              </p>
            </div>
            <div className="inline-block border border-terminal-cyan bg-terminal-surface/50 backdrop-blur px-6 py-3 font-mono text-terminal-cyan">
              Status: <span className="text-terminal-green animate-pulse">ONLINE</span> | 
              Sources: <span className="text-terminal-amber">6</span> | 
              Uptime: <span className="text-terminal-text">99.7%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Data Modules Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="text-3xl font-mono font-bold text-terminal-cyan glow-cyan mb-4">
              [DATA_MODULES]
            </h2>
            <p className="font-mono text-terminal-muted max-w-3xl">
              // Select module to initialize data stream
              <br />
              // All endpoints verified | Government APIs only
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link key={category.name} href={category.href} className="group">
                  <div className="terminal-card rounded border-glow-cyan hover:shadow-lg hover:shadow-terminal-cyan/20 transition-all duration-300 h-full">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Icon className={`h-8 w-8 text-${category.color} ${category.glowColor} group-hover:animate-pulse`} />
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-terminal-green animate-pulse" />
                          <span className="text-xs font-mono text-terminal-green">{category.status}</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="text-lg font-mono font-semibold text-terminal-text mb-2 group-hover:text-terminal-cyan transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-terminal-muted font-mono leading-relaxed">
                          {category.description}
                        </p>
                      </div>
                      
                      <div className="border-t border-terminal-border pt-4">
                        <p className="text-xs font-mono text-terminal-amber">
                          {category.stats}
                        </p>
                      </div>
                      
                      <div className="flex items-center mt-4 text-terminal-cyan font-mono text-sm">
                        <span className="mr-2">access_module</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* System Information */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-terminal-surface/30">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-mono font-bold text-terminal-green glow-green mb-8 text-center">
            [SYSTEM_INFO]
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="terminal-card p-6">
              <div className="text-terminal-cyan mb-4 text-2xl">📡</div>
              <h3 className="text-lg font-mono font-semibold text-terminal-text mb-2">RAW_DATA</h3>
              <p className="text-sm font-mono text-terminal-muted leading-relaxed">
                Direct API feeds from government sources. Zero editorial filtering. 
                Numbers only.
              </p>
            </div>
            
            <div className="terminal-card p-6">
              <div className="text-terminal-amber mb-4 text-2xl">⚙️</div>
              <h3 className="text-lg font-mono font-semibold text-terminal-text mb-2">NO_BIAS</h3>
              <p className="text-sm font-mono text-terminal-muted leading-relaxed">
                Automated data processing. No human interpretation layers. 
                Draw your own conclusions.
              </p>
            </div>
            
            <div className="terminal-card p-6">
              <div className="text-terminal-green mb-4 text-2xl">🔗</div>
              <h3 className="text-lg font-mono font-semibold text-terminal-text mb-2">VERIFIABLE</h3>
              <p className="text-sm font-mono text-terminal-muted leading-relaxed">
                Source links provided. Trace every number back to origin. 
                Trust through transparency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Algorithm Explanation */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-mono font-bold text-terminal-amber glow-amber mb-6">
                [PER_CAPITA_ALGORITHM]
              </h2>
              <p className="font-mono text-terminal-muted mb-6 leading-relaxed">
                // Population normalization function for statistical comparison
                <br />
                // Enables cross-jurisdictional analysis regardless of population variance
              </p>
              
              <div className="terminal-card p-6">
                <div className="font-mono text-terminal-cyan mb-4 text-lg">
                  function calculatePerCapita()
                </div>
                <div className="font-mono text-terminal-text space-y-2">
                  <p>{'{'}</p>
                  <p className="ml-4">rate = (count / population) * 100000;</p>
                  <p className="ml-4">return normalize(rate);</p>
                  <p>{'}'}</p>
                </div>
              </div>
            </div>
            
            <div className="terminal-card p-8">
              <h3 className="text-xl font-mono font-semibold text-terminal-green glow-green mb-6">
                [EXECUTION_EXAMPLE]
              </h3>
              <div className="space-y-6 font-mono text-sm">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-terminal-cyan/20 border border-terminal-cyan rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-terminal-cyan">🏙️</span>
                  </div>
                  <div className="text-terminal-text">
                    <p>jurisdiction_a.count = 10000</p>
                    <p className="text-terminal-muted">jurisdiction_a.population = 10000000</p>
                    <p className="text-terminal-cyan">result = 100 per 100k</p>
                  </div>
                </div>
                
                <div className="border-l-2 border-terminal-amber ml-6 pl-4">
                  <p className="text-terminal-amber">vs</p>
                </div>
                
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-terminal-red/20 border border-terminal-red rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-terminal-red">🏘️</span>
                  </div>
                  <div className="text-terminal-text">
                    <p>jurisdiction_b.count = 500</p>
                    <p className="text-terminal-muted">jurisdiction_b.population = 100000</p>
                    <p className="text-terminal-red">result = 500 per 100k</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-terminal-border">
                  <p className="text-terminal-green">
                    // jurisdiction_b rate 5x higher despite lower absolute count
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Terminal Prompt */}
      <section className="bg-gradient-to-r from-terminal-bg to-terminal-surface py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="font-mono text-terminal-cyan glow-cyan mb-6">
            <h2 className="text-3xl font-bold mb-2">[READY_TO_EXECUTE]</h2>
            <p className="text-terminal-muted">
              user@gov-data:~$ ./explore_module --interactive
            </p>
          </div>
          
          <p className="font-mono text-lg text-terminal-text mb-8">
            Select data module above to initialize visualization stream.
            <br />
            All datasets available for download and independent analysis.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center font-mono">
            <Link
              href="/debt"
              className="terminal-button px-8 py-3 text-base hover:bg-terminal-cyan/10"
            >
              ./debt --execute
            </Link>
            <Link
              href="/about"
              className="border border-terminal-amber text-terminal-amber px-8 py-3 hover:bg-terminal-amber/10 transition-colors"
            >
              ./about --info
            </Link>
          </div>
        </div>
      </section>

      {/* System Footer */}
      <section className="bg-terminal-bg border-t border-terminal-border py-8 px-4 text-center">
        <div className="font-mono text-sm text-terminal-muted">
          <p className="mb-2">
            [DATA_SOURCES] FBI | DHS | Treasury | BLS | OMB | FEC
          </p>
          <p>
            [SYSTEM] Built by{' '}
            <a href="https://telep.io" className="text-terminal-cyan hover:glow-cyan transition-all">
              Telep.IO
            </a>{' '}
            | Making government data accessible to all users
          </p>
        </div>
      </section>
    </div>
  );
}
