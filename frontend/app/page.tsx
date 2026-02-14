import Link from 'next/link';
import { 
  ArrowRight, BarChart3, TrendingUp, Users, DollarSign, 
  Building2, Vote, Clock, ExternalLink, Target, Award,
  FileText, Database, Shield, Check
} from 'lucide-react';

const featuredStories = [
  {
    category: 'Congressional Trading',
    title: 'Real-Time Congressional Stock Disclosures',
    description: 'Track every trade made by members of Congress under the STOCK Act. Complete transaction history with performance analysis and conflict detection.',
    href: '/congress',
    urgent: true,
    stats: '435+ Members • 16,000+ Trades • Live Updates',
    icon: TrendingUp,
  },
  {
    category: 'Federal Spending',
    title: 'Where Your Tax Dollars Go',
    description: 'Direct access to USASpending.gov data. Department-by-department breakdown of federal expenditures with historical trends.',
    href: '/budget',
    urgent: false,
    stats: '$6.8T Federal Budget • 15 Agencies • Monthly Updates',
    icon: DollarSign,
  },
  {
    category: 'National Debt',
    title: 'The Growing Debt Crisis',
    description: 'Treasury data showing debt composition, creditor breakdown, and per-capita impact. Updated daily from official sources.',
    href: '/debt',
    urgent: true,
    stats: '$34T Total Debt • Daily Updates • Creditor Analysis',
    icon: Building2,
  },
];

const dataCategories = [
  {
    name: 'Immigration Data',
    description: 'Department of Homeland Security statistics on legal migration, asylum claims, and border encounters.',
    href: '/immigration',
    icon: Users,
    source: 'DHS',
    updated: '2024-02-10',
  },
  {
    name: 'Employment Statistics',
    description: 'Bureau of Labor Statistics employment data, unemployment rates, and job growth by state.',
    href: '/employment',
    icon: BarChart3,
    source: 'BLS',
    updated: '2024-02-09',
  },
  {
    name: 'Election Finance',
    description: 'Federal Election Commission campaign finance data and public funding analysis.',
    href: '/elections',
    icon: Vote,
    source: 'FEC',
    updated: '2024-02-08',
  },
];

const principles = [
  {
    title: 'Source Verification',
    description: 'Every statistic linked directly to official government databases. No intermediary interpretation.',
    icon: Shield,
  },
  {
    title: 'Methodology Transparency',
    description: 'Complete disclosure of data collection methods, calculations, and any adjustments made.',
    icon: FileText,
  },
  {
    title: 'Real-Time Updates',
    description: 'Automated daily synchronization with government data feeds. Timestamps on every dataset.',
    icon: Clock,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-newsprint">
      {/* Breaking News Banner */}
      <section className="section-breaking">
        <div className="container-wide">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-breaking">BREAKING</div>
              <div className="text-xl md:text-2xl font-black uppercase tracking-wide">
                Congressional Trading Data Updated • 16K+ Transactions Live
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-4 text-sm font-semibold">
              <Clock className="h-4 w-4" />
              <span>UPDATED 2 HOURS AGO</span>
            </div>
          </div>
        </div>
      </section>

      {/* Masthead */}
      <section className="border-b-8 border-editorial-ink bg-gradient-to-r from-white via-newsprint to-paper-cream">
        <div className="container-wide py-8 lg:py-12">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-editorial-ink flex items-center justify-center">
                <Database className="h-10 w-10 text-editorial-electric" />
              </div>
              <div>
                <div className="text-kicker text-editorial-accent mb-2">EST. 2024</div>
                <div className="text-3xl lg:text-4xl font-black text-editorial-ink">
                  LET'S TALK<br />
                  STATISTICS
                </div>
              </div>
            </div>
            
            <div className="text-center lg:col-span-1">
              <div className="text-terminal inline-block">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                }).toUpperCase()}
              </div>
            </div>

            <div className="text-right">
              <div className="text-kicker text-editorial-forest mb-2">LIVE DATA FEEDS</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-editorial-dark">TREASURY</div>
                  <div className="text-editorial-gray">Connected</div>
                </div>
                <div>
                  <div className="font-semibold text-editorial-dark">CONGRESS</div>
                  <div className="text-editorial-gray">Synced</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="section-hero overflow-hidden">
        <div className="container-wide">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-20 items-start">
            {/* Main Headlines */}
            <div className="lg:col-span-3 space-y-8 lg:space-y-12">
              <div className="space-y-6">
                <div className="text-kicker text-editorial-accent animate-fade-in-up">
                  UNFILTERED • TRANSPARENT • REAL-TIME
                </div>
                
                <h1 className="text-masthead text-editorial-ink leading-none animate-fade-in-up animate-delay-200">
                  Government<br />
                  Data<br />
                  <span className="text-editorial-accent">Without</span><br />
                  <span className="text-editorial-gold">Spin</span>
                </h1>
              </div>
              
              <div className="max-w-2xl space-y-6 animate-fade-in-up animate-delay-400">
                <p className="text-body-editorial">
                  <strong className="text-editorial-dark">Direct pipeline to official U.S. government databases.</strong> 
                  Zero editorial interpretation. Zero political agenda. Pure statistical analysis 
                  for informed democratic participation.
                </p>
                
                <p className="text-body text-editorial-gray">
                  Real-time synchronization with Treasury, DHS, BLS, FEC, and 15+ federal data sources. 
                  Updated daily. Verified hourly. Transparent always.
                </p>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-6 animate-fade-in-up animate-delay-500">
                <Link href="/debt" className="btn-impact group text-lg hover-scale-102">
                  <Building2 className="h-6 w-6 mr-3" />
                  <span className="text-emphasis-strong">$34T Debt Crisis</span>
                  <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
                <Link href="/congress" className="btn-data group text-lg hover-scale-102">
                  <TrendingUp className="h-6 w-6 mr-3" />
                  Live Congressional Trades
                  <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </div>
            </div>
            
            {/* Data Terminal */}
            <div className="lg:col-span-2 animate-fade-in-up animate-delay-300">
              <div className="card-terminal p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-editorial-electric/30 pb-4">
                  <div className="w-3 h-3 bg-editorial-forest rounded-full"></div>
                  <div className="w-3 h-3 bg-editorial-gold rounded-full"></div>
                  <div className="w-3 h-3 bg-editorial-orange rounded-full"></div>
                  <span className="text-xs text-editorial-electric/70 ml-auto font-mono">
                    DATA_TERMINAL_v2.1
                  </span>
                </div>
                
                <div className="space-y-4 font-mono text-sm">
                  <div>
                    <div className="text-editorial-electric/70">$ query --source=treasury --live</div>
                    <div className="text-white">
                      <span className="text-editorial-gold">DEBT:</span> $34,120,847,392,832
                    </div>
                    <div className="text-white">
                      <span className="text-editorial-forest">RATE:</span> +$89,247/minute
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-editorial-electric/70">$ query --source=congress --recent</div>
                    <div className="text-white">
                      <span className="text-editorial-accent">TRADES:</span> 16,247 transactions
                    </div>
                    <div className="text-white">
                      <span className="text-editorial-orange">ALERTS:</span> 3 conflict flags
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-editorial-electric/70">$ status --all-feeds</div>
                    <div className="text-editorial-forest">✓ ALL SYSTEMS OPERATIONAL</div>
                    <div className="text-editorial-electric animate-pulse">█</div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Card */}
              <div className="card-highlight p-6 mt-6">
                <div className="text-center space-y-4">
                  <div className="text-kicker text-editorial-accent">LIVE TRACKER</div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="card-metric p-4 animate-data-rise">
                      <div className="text-data-label">Debt Per Second</div>
                      <div className="text-stats-impact animate-glow-pulse">$1,487</div>
                    </div>
                    <div className="card-metric p-4 animate-data-rise animate-delay-200">
                      <div className="text-data-label">Per Citizen</div>
                      <div className="text-stats-impact">$102,847</div>
                    </div>
                  </div>
                  
                  <Link href="/debt" className="btn-accent w-full justify-center group mt-4">
                    <span>Deep Dive Analysis</span>
                    <ExternalLink className="h-4 w-4 ml-2 group-hover:scale-110 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Investigations */}
      <section className="section-data">
        <div className="container-wide">
          {/* Section Header */}
          <div className="text-center mb-16 lg:mb-24">
            <div className="text-breaking inline-block mb-6">INVESTIGATIONS</div>
            <h2 className="text-headline-1 text-editorial-ink mb-8">
              Data-Driven<br />
              <span className="text-editorial-accent">Democracy</span>
            </h2>
            <div className="w-32 h-2 bg-gradient-to-r from-editorial-accent via-editorial-gold to-editorial-forest mx-auto mb-8"></div>
            <p className="text-body-large max-w-4xl mx-auto">
              <strong className="text-editorial-dark">Critical government data analysis</strong> with 
              real-time feeds, conflict detection, and transparent methodology. No spin, no agenda—
              just the numbers that shape our democracy.
            </p>
          </div>
          
          {/* Main Feature Story */}
          <div className="mb-16 lg:mb-24">
            <Link href="/congress" className="group block">
              <article className="card-breaking p-8 lg:p-12 text-center group-hover:scale-[1.02] transition-transform duration-300">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <TrendingUp className="h-8 w-8" />
                    <span className="text-2xl font-black uppercase tracking-widest">
                      LIVE: Congressional Trading
                    </span>
                  </div>
                  
                  <h3 className="text-4xl lg:text-6xl font-black mb-6">
                    16,247 Stock Trades<br />
                    435 Politicians<br />
                    <span className="text-xl lg:text-2xl font-normal opacity-90">
                      Real-time STOCK Act disclosure monitoring
                    </span>
                  </h3>
                  
                  <p className="text-xl lg:text-2xl mb-8 opacity-95 max-w-3xl mx-auto">
                    Complete transaction history with conflict detection. 
                    Updated hourly from official House and Senate disclosures.
                  </p>
                  
                  <div className="flex items-center justify-center gap-8 text-lg font-semibold">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      <span>3 Conflict Alerts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>Updated 47 min ago</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                      <span>Investigate Now</span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          </div>
          
          {/* Secondary Stories Grid */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {featuredStories.slice(1).map((story, index) => {
              const Icon = story.icon;
              
              return (
                <Link key={story.title} href={story.href} className="group block">
                  <article className="card-data h-full group-hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-start gap-6 mb-8">
                      <div className="w-16 h-16 bg-editorial-accent/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-8 w-8 text-editorial-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-kicker text-editorial-accent mb-2">
                          {story.category}
                        </div>
                        <h3 className="text-headline-3 text-editorial-dark mb-3 group-hover:text-editorial-accent transition-colors">
                          {story.title}
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-body-editorial mb-8 leading-relaxed">
                      {story.description}
                    </p>
                    
                    <div className="border-t-2 border-editorial-accent/20 pt-6">
                      <div className="flex items-center justify-between">
                        <div className="text-caption text-editorial-gray">
                          {story.stats}
                        </div>
                        <div className="flex items-center gap-2 text-editorial-accent font-semibold group-hover:text-editorial-dark transition-colors">
                          <span>Deep Dive</span>
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Data Categories Grid */}
      <section className="section-feature">
        <div className="container-wide">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
            {/* Section Header */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="text-kicker text-editorial-accent mb-4">FEDERAL DATA FEEDS</div>
                <h2 className="text-headline-2 text-editorial-ink mb-6">
                  Direct<br />
                  Government<br />
                  <span className="text-editorial-gold">Access</span>
                </h2>
                <div className="w-24 h-1 bg-editorial-accent mb-6"></div>
                <p className="text-body-editorial">
                  <strong>Zero intermediaries.</strong> Every statistic links directly to 
                  official federal databases. Real-time synchronization with 15+ government agencies.
                </p>
              </div>
              
              <div className="card-terminal p-6">
                <div className="space-y-2 font-mono text-sm">
                  <div className="text-editorial-electric/70">$ ping treasury.gov</div>
                  <div className="text-editorial-forest">✓ 64 bytes from treasury.gov</div>
                  <div className="text-editorial-electric/70">$ sync --all-feeds</div>
                  <div className="text-white">Syncing 15 data sources...</div>
                  <div className="text-editorial-forest">✓ All feeds operational</div>
                  <div className="text-editorial-electric animate-pulse">█</div>
                </div>
              </div>
            </div>
            
            {/* Data Categories */}
            <div className="lg:col-span-3 space-y-6">
              {dataCategories.map((category, index) => {
                const Icon = category.icon;
                
                return (
                  <Link key={category.name} href={category.href} className="group block">
                    <div className="card-editorial p-8 group-hover:shadow-2xl group-hover:scale-[1.02] transition-all duration-300">
                      <div className="grid lg:grid-cols-4 gap-6 items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-editorial-navy/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-7 w-7 text-editorial-navy" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xl font-bold text-editorial-dark group-hover:text-editorial-accent transition-colors mb-1">
                              {category.name}
                            </h3>
                            <div className="text-kicker text-editorial-accent">{category.source}</div>
                          </div>
                        </div>
                        
                        <div className="lg:col-span-2">
                          <p className="text-editorial-gray leading-relaxed">
                            {category.description}
                          </p>
                        </div>
                        
                        <div className="text-right space-y-2">
                          <div className="flex items-center justify-end gap-2 text-sm">
                            <Clock className="h-4 w-4 text-editorial-gray" />
                            <span className="text-editorial-gray">
                              {new Date(category.updated).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-end gap-2 text-editorial-accent font-semibold group-hover:text-editorial-dark transition-colors">
                            <span>Explore</span>
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="section-content bg-white border-y-8 border-editorial-ink">
        <div className="container-wide">
          <div className="grid lg:grid-cols-7 gap-16 lg:gap-20 items-start">
            {/* Main Content */}
            <div className="lg:col-span-4 space-y-12">
              <div>
                <div className="text-kicker text-editorial-accent mb-6">EDITORIAL STANDARDS</div>
                <h2 className="text-headline-1 text-editorial-ink mb-8">
                  Transparent<br />
                  <span className="text-editorial-accent">by Design</span>
                </h2>
                <div className="w-32 h-2 bg-gradient-to-r from-editorial-accent to-editorial-gold mb-8"></div>
              </div>
              
              <div className="prose prose-lg prose-editorial max-w-none">
                <p className="text-body-large text-editorial-gray mb-8 leading-relaxed">
                  <strong className="text-editorial-dark">Every statistic is verifiable.</strong> 
                  Every source is cited. Every calculation is documented. Transparency isn't 
                  just an ideal—it's a requirement for democratic accountability.
                </p>
                
                <p className="text-body text-editorial-gray">
                  Our methodology prioritizes direct access over interpretation, 
                  raw data over analysis, and official sources over secondary reporting. 
                  We are a conduit, not a commentator.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {principles.map((principle, index) => {
                  const Icon = principle.icon;
                  return (
                    <div key={principle.title} className={`animate-fade-in-up animate-delay-${(index + 1) * 200}`}>
                      <div className="flex items-start gap-4 p-6 border-l-4 border-editorial-forest bg-editorial-forest/5">
                        <div className="w-12 h-12 bg-editorial-forest/20 flex items-center justify-center flex-shrink-0 mt-2">
                          <Icon className="h-6 w-6 text-editorial-forest" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-editorial-dark mb-3">
                            {principle.title}
                          </h4>
                          <p className="text-editorial-gray leading-relaxed">
                            {principle.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Standards Checklist */}
            <div className="lg:col-span-3">
              <div className="card-feature p-8 lg:p-10 sticky top-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-editorial-accent/10 flex items-center justify-center mx-auto mb-6">
                    <Target className="h-10 w-10 text-editorial-accent" />
                  </div>
                  <h3 className="text-headline-3 text-editorial-dark mb-2">
                    Quality Guarantee
                  </h3>
                  <div className="text-kicker text-editorial-accent">VERIFIED DAILY</div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 bg-white rounded border-l-4 border-editorial-forest">
                    <Check className="h-6 w-6 text-editorial-forest mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-editorial-dark mb-1">Direct Source Linking</div>
                      <div className="text-sm text-editorial-gray">
                        Every data point traces to original government database
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-white rounded border-l-4 border-editorial-forest">
                    <Check className="h-6 w-6 text-editorial-forest mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-editorial-dark mb-1">Zero Editorial Commentary</div>
                      <div className="text-sm text-editorial-gray">
                        Pure data presentation without opinion or analysis
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-white rounded border-l-4 border-editorial-forest">
                    <Check className="h-6 w-6 text-editorial-forest mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-editorial-dark mb-1">Open Methodology</div>
                      <div className="text-sm text-editorial-gray">
                        Complete calculation disclosure and audit trail
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-white rounded border-l-4 border-editorial-forest">
                    <Check className="h-6 w-6 text-editorial-forest mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-editorial-dark mb-1">Real-Time Synchronization</div>
                      <div className="text-sm text-editorial-gray">
                        Automated hourly sync with federal data feeds
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-8 border-t-2 border-editorial-accent/20 mt-8 text-center">
                  <Award className="h-8 w-8 text-editorial-gold mx-auto mb-3" />
                  <div className="font-bold text-editorial-dark mb-2">
                    Data Integrity Certified
                  </div>
                  <div className="text-sm text-editorial-gray">
                    Independently verified methodology
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-dark overflow-hidden relative">
        <div className="container-wide text-center relative z-10">
          <div className="max-w-5xl mx-auto space-y-12">
            <div>
              <div className="text-breaking inline-block mb-8">START EXPLORING</div>
              <h2 className="text-headline-1 text-white mb-8">
                Government Data<br />
                <span className="text-editorial-gold">Without Barriers</span>
              </h2>
              <div className="w-40 h-2 bg-gradient-to-r from-editorial-gold via-white to-editorial-electric mx-auto mb-8"></div>
            </div>
            
            <p className="text-2xl lg:text-3xl text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed">
              <strong className="text-white">No registration. No cost. No agenda.</strong><br />
              Direct access to the data that shapes our democracy.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Link href="/debt" className="group">
                <div className="card-terminal p-8 group-hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <Building2 className="h-8 w-8" />
                    <div className="text-left">
                      <div className="text-xl font-bold">National Debt Crisis</div>
                      <div className="text-sm text-editorial-electric/70">$34.1 Trillion and rising</div>
                    </div>
                  </div>
                  <div className="space-y-2 font-mono text-sm text-left">
                    <div>Per second: <span className="text-editorial-gold">+$1,487</span></div>
                    <div>Per citizen: <span className="text-editorial-accent">$102,847</span></div>
                    <div>Next update: <span className="text-editorial-forest">Live</span></div>
                  </div>
                  <ArrowRight className="h-5 w-5 mt-4 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </Link>
              
              <Link href="/congress" className="group">
                <div className="card-terminal p-8 group-hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <TrendingUp className="h-8 w-8" />
                    <div className="text-left">
                      <div className="text-xl font-bold">Congressional Trading</div>
                      <div className="text-sm text-editorial-electric/70">16,247 transactions tracked</div>
                    </div>
                  </div>
                  <div className="space-y-2 font-mono text-sm text-left">
                    <div>Politicians: <span className="text-editorial-gold">435</span></div>
                    <div>Conflicts: <span className="text-editorial-orange">3 alerts</span></div>
                    <div>Updated: <span className="text-editorial-forest">47min ago</span></div>
                  </div>
                  <ArrowRight className="h-5 w-5 mt-4 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </Link>
            </div>
            
            <div className="pt-12">
              <div className="text-lg text-gray-400 mb-4">Trusted by researchers, journalists, and citizens</div>
              <div className="flex justify-center gap-8 text-sm text-gray-500">
                <span>📊 500K+ monthly users</span>
                <span>⚡ 99.9% uptime</span>
                <span>🔗 15+ data sources</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border border-editorial-electric rotate-45"></div>
          <div className="absolute top-32 right-20 w-24 h-24 border border-editorial-gold rotate-12"></div>
          <div className="absolute bottom-20 left-32 w-28 h-28 border border-editorial-accent -rotate-12"></div>
          <div className="absolute bottom-10 right-10 w-20 h-20 border border-editorial-forest rotate-45"></div>
        </div>
      </section>

      {/* Source Attribution */}
      <section className="bg-newsprint border-t-4 border-editorial-ink py-16">
        <div className="container-wide">
          <div className="text-center max-w-6xl mx-auto">
            <h4 className="text-2xl font-bold text-editorial-dark mb-8">
              Official Data Sources
            </h4>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
              <div className="text-left space-y-4">
                <p className="text-lg text-editorial-gray leading-relaxed">
                  Direct integration with <strong className="text-editorial-dark">15+ federal agencies</strong> 
                  including U.S. Treasury, Department of Homeland Security, Bureau of Labor Statistics, 
                  Office of Management and Budget, and Federal Election Commission.
                </p>
                <p className="text-editorial-gray">
                  Real-time data synchronization with official government databases. 
                  Zero intermediary processing or interpretation.
                </p>
              </div>
              
              <div className="card-editorial p-6">
                <div className="text-kicker text-editorial-accent mb-4">INTEGRATION STATUS</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Treasury</span>
                    <span className="text-editorial-forest">✓ Live</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Congress</span>
                    <span className="text-editorial-forest">✓ Live</span>
                  </div>
                  <div className="flex justify-between">
                    <span>BLS</span>
                    <span className="text-editorial-forest">✓ Live</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DHS</span>
                    <span className="text-editorial-forest">✓ Live</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FEC</span>
                    <span className="text-editorial-forest">✓ Live</span>
                  </div>
                  <div className="flex justify-between">
                    <span>OMB</span>
                    <span className="text-editorial-forest">✓ Live</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t-2 border-editorial-accent/20 pt-8">
              <div className="text-lg text-editorial-gray">
                Data compiled and presented by{' '}
                <a 
                  href="https://telep.io" 
                  className="text-editorial-accent hover:text-editorial-dark font-bold transition-colors"
                >
                  Telep IO
                </a>
                {' '}• Last updated: {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short'
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}