import Link from 'next/link';
import { 
  ArrowRight, BarChart3, TrendingUp, Users, DollarSign, 
  Building2, Vote, Clock, ExternalLink, Target, Award,
  FileText, Database, Shield, Check, Zap, Satellite,
  Radio, Activity, Globe, Radar, Settings, Monitor
} from 'lucide-react';

const missionData = [
  {
    category: 'PRIORITY ALPHA',
    title: 'Congressional Trading Protocol',
    description: 'Real-time monitoring of 435+ political entities. Advanced pattern recognition detecting 16,000+ financial transactions with automated conflict analysis.',
    href: '/congress',
    status: 'CRITICAL',
    stats: '435 SUBJECTS • 16K+ TRANSACTIONS • LIVE MONITORING',
    icon: TrendingUp,
    alert: true,
  },
  {
    category: 'BUDGET MATRIX',
    title: 'Federal Resource Allocation',
    description: 'Direct interface with USASpending.gov mainframe. Department-level expenditure analysis with historical trend computation.',
    href: '/budget',
    status: 'OPERATIONAL',
    stats: '$6.8T FEDERAL BUDGET • 15 AGENCIES • HOURLY SYNC',
    icon: DollarSign,
    alert: false,
  },
  {
    category: 'DEBT MONITOR',
    title: 'National Debt Tracking System',
    description: 'Treasury Department direct feed. Real-time debt accumulation with creditor breakdown and per-capita impact calculations.',
    href: '/debt',
    status: 'WARNING',
    stats: '$34T TOTAL DEBT • LIVE FEED • CREDITOR MAPPING',
    icon: Building2,
    alert: true,
  },
];

const systemModules = [
  {
    name: 'Immigration Data Matrix',
    description: 'DHS statistical feed analysis. Legal migration patterns, asylum processing metrics, and border encounter data streams.',
    href: '/immigration',
    icon: Users,
    source: 'DHS-NET',
    status: 'ONLINE',
    updated: '2024-02-10',
  },
  {
    name: 'Employment Statistics Grid',
    description: 'Bureau of Labor Statistics real-time interface. Employment metrics, unemployment calculations, and regional job market analysis.',
    href: '/employment',
    icon: BarChart3,
    source: 'BLS-CORE',
    status: 'ONLINE',
    updated: '2024-02-09',
  },
  {
    name: 'Electoral Finance Tracker',
    description: 'Federal Election Commission database integration. Campaign finance monitoring and public funding analysis protocols.',
    href: '/elections',
    icon: Vote,
    source: 'FEC-MAIN',
    status: 'ONLINE',
    updated: '2024-02-08',
  },
];

const systemProtocols = [
  {
    title: 'Data Integrity Protocol',
    description: 'Every data point verified against primary government mainframes. Zero intermediary processing. Direct pipeline authentication.',
    icon: Shield,
  },
  {
    title: 'Methodology Transparency',
    description: 'Complete algorithm disclosure. All calculations, adjustments, and processing methods documented in mission logs.',
    icon: FileText,
  },
  {
    title: 'Real-Time Synchronization',
    description: 'Automated hourly sync protocols with federal data networks. Mission-critical timestamps on all datasets.',
    icon: Clock,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Mission Status Alert Bar */}
      <section className="section-mission-status">
        <div className="container-wide">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-6">
              <div className="text-status-alert">PRIORITY ALPHA</div>
              <div className="text-xl md:text-2xl font-black uppercase tracking-wide text-white font-orbitron">
                Congressional Trading Data • Live Updates • 16K+ Transactions
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-4 text-sm font-semibold text-white">
              <Satellite className="h-4 w-4" />
              <span className="font-jetbrains tracking-wide">SYNC: 0047 MIN AGO</span>
            </div>
          </div>
        </div>
      </section>

      {/* Command Center Header */}
      <section className="border-b-4 border-electric-green bg-gradient-to-r from-panel-dark via-space-blue to-panel-dark relative overflow-hidden">
        <div className="container-wide py-12 lg:py-16 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-electric-green/20 border-2 border-electric-green flex items-center justify-center relative overflow-hidden">
                <Database className="h-12 w-12 text-electric-green animate-pulse-glow" />
                <div className="absolute inset-0 bg-electric-green/10 animate-scanner-sweep"></div>
              </div>
              <div>
                <div className="text-mission-control mb-2">EST. 2024</div>
                <div className="text-3xl lg:text-4xl font-black text-star-white font-orbitron">
                  MISSION CONTROL<br />
                  <span className="text-electric-green">DATA SYSTEMS</span>
                </div>
              </div>
            </div>
            
            <div className="text-center lg:col-span-1">
              <div className="card-terminal inline-block px-6 py-3">
                <div className="text-terminal font-jetbrains">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  }).toUpperCase()}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-mission-control mb-2">NETWORK STATUS</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-electric-green font-exo">TREASURY-NET</div>
                  <div className="status-online">CONNECTED</div>
                </div>
                <div>
                  <div className="font-semibold text-electric-green font-exo">CONGRESS-LINK</div>
                  <div className="status-online">SYNCHRONIZED</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}
          />
        </div>
      </section>

      {/* Main Command Interface */}
      <section className="section-command-center">
        <div className="container-wide">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-20 items-start">
            {/* Primary Mission Interface */}
            <div className="lg:col-span-3 space-y-8 lg:space-y-12 relative z-10">
              <div className="space-y-6">
                <div className="text-mission-control animate-pulse">
                  CLASSIFIED • REAL-TIME • MISSION-CRITICAL
                </div>
                
                <h1 className="text-masthead leading-none relative">
                  Government<br />
                  Data<br />
                  <span className="text-mars-orange">Mission</span><br />
                  <span className="text-electric-green animate-hologram-flicker">Control</span>
                </h1>

                {/* Holographic subtitle effect */}
                <div className="absolute -top-4 -left-4 w-full h-full opacity-20 pointer-events-none">
                  <h1 className="text-masthead leading-none text-electric-green blur-sm animate-hologram-flicker">
                    Government<br />
                    Data<br />
                    <span className="text-mars-orange">Mission</span><br />
                    <span className="text-electric-green">Control</span>
                  </h1>
                </div>
              </div>
              
              <div className="max-w-2xl space-y-6 relative">
                <p className="text-body-space text-steel-gray">
                  <strong className="text-star-white">Advanced government data analysis system.</strong> 
                  Direct neural interface with federal databases. Zero political filters. 
                  Pure statistical computation for enhanced democratic oversight.
                </p>
                
                <p className="text-body-tech text-gunmetal">
                  Real-time synchronization protocols established with Treasury, DHS, BLS, FEC, 
                  and 15+ federal data networks. Updated continuously. Verified hourly. 
                  Mission parameters: total transparency.
                </p>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-6">
                <Link href="/debt" className="btn-launch group text-lg hover-lift-tech">
                  <Building2 className="h-6 w-6 mr-3" />
                  <span className="font-bold">$34T DEBT CRISIS</span>
                  <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
                <Link href="/congress" className="btn-system group text-lg hover-lift-tech">
                  <TrendingUp className="h-6 w-6 mr-3" />
                  CONGRESSIONAL MONITORING
                  <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </div>
            </div>
            
            {/* Mission Control Terminal */}
            <div className="lg:col-span-2 relative">
              <div className="card-terminal p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-electric-green/30 pb-4">
                  <div className="w-3 h-3 bg-electric-green rounded-full animate-pulse-glow"></div>
                  <div className="w-3 h-3 bg-mars-orange rounded-full animate-pulse-glow"></div>
                  <div className="w-3 h-3 bg-warning-amber rounded-full animate-pulse-glow"></div>
                  <span className="text-xs text-electric-green/70 ml-auto font-jetbrains tracking-wide">
                    MISSION_TERMINAL_v3.1
                  </span>
                </div>
                
                <div className="space-y-4 font-jetbrains text-sm">
                  <div>
                    <div className="text-electric-green/70">$ exec query --source=treasury --priority=alpha</div>
                    <div className="text-star-white">
                      <span className="text-mars-orange">DEBT_TOTAL:</span> $34,120,847,392,832
                    </div>
                    <div className="text-star-white">
                      <span className="text-warning-amber">RATE_INCREASE:</span> +$89,247/minute
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-electric-green/70">$ monitor congress --live-feed --conflict-detect</div>
                    <div className="text-star-white">
                      <span className="text-electric-green">TRANSACTIONS:</span> 16,247 logged
                    </div>
                    <div className="text-star-white">
                      <span className="text-mars-orange">ALERT_FLAGS:</span> 3 conflicts detected
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-electric-green/70">$ system status --all-networks</div>
                    <div className="text-electric-green">✓ ALL SYSTEMS OPERATIONAL</div>
                    <div className="text-electric-green animate-pulse">█</div>
                  </div>
                </div>
              </div>

              {/* Real-time Data Grid */}
              <div className="card-hologram p-6 mt-6">
                <div className="text-center space-y-4">
                  <div className="text-mission-control">LIVE METRICS</div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="card-data-grid p-4">
                      <div className="text-xs text-electric-green/70 font-jetbrains mb-2">DEBT/SECOND</div>
                      <div className="text-data-value animate-hologram-flicker font-orbitron">$1,487</div>
                    </div>
                    <div className="card-data-grid p-4">
                      <div className="text-xs text-electric-green/70 font-jetbrains mb-2">PER CITIZEN</div>
                      <div className="text-data-value font-orbitron">$102,847</div>
                    </div>
                  </div>
                  
                  <Link href="/debt" className="btn-system w-full justify-center group mt-4">
                    <span>DEEP ANALYSIS PROTOCOL</span>
                    <ExternalLink className="h-4 w-4 ml-2 group-hover:scale-110 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Priority Mission Briefings */}
      <section className="section-data-matrix">
        <div className="container-wide">
          {/* Section Header */}
          <div className="text-center mb-16 lg:mb-24">
            <div className="text-status-alert inline-block mb-6">MISSION BRIEFINGS</div>
            <h2 className="text-headline-1 text-star-white mb-8 font-orbitron">
              Priority<br />
              <span className="text-electric-green">Intelligence</span><br />
              <span className="text-mars-orange">Operations</span>
            </h2>
            <div className="w-32 h-2 bg-gradient-to-r from-electric-green via-mars-orange to-violet-plasma mx-auto mb-8"></div>
            <p className="text-body-space max-w-4xl mx-auto text-steel-gray">
              <strong className="text-star-white">Mission-critical government data analysis</strong> with 
              real-time feeds, automated conflict detection, and transparent methodology protocols. 
              Zero political interpretation—only verified statistical intelligence.
            </p>
          </div>
          
          {/* Primary Alert Mission */}
          <div className="mb-16 lg:mb-24">
            <Link href="/congress" className="group block">
              <article className="card-alert p-8 lg:p-12 text-center hover-lift-tech transition-all duration-300">
                <div className="max-w-4xl mx-auto relative z-10">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <TrendingUp className="h-8 w-8 text-mars-orange" />
                    <span className="text-2xl font-black uppercase tracking-widest text-white font-orbitron">
                      ALERT: CONGRESSIONAL MONITORING ACTIVE
                    </span>
                  </div>
                  
                  <h3 className="text-4xl lg:text-6xl font-black mb-6 text-white font-orbitron">
                    16,247 Transactions<br />
                    435 Political Entities<br />
                    <span className="text-xl lg:text-2xl font-normal opacity-90 text-mars-orange">
                      Real-time STOCK Act compliance monitoring
                    </span>
                  </h3>
                  
                  <p className="text-xl lg:text-2xl mb-8 opacity-95 max-w-3xl mx-auto text-steel-gray">
                    Advanced pattern recognition with automated conflict detection protocols. 
                    Updated hourly from official House and Senate disclosure networks.
                  </p>
                  
                  <div className="flex items-center justify-center gap-8 text-lg font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-mars-orange" />
                      <span>3 Alert Protocols Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-electric-green" />
                      <span>Sync: 47 min ago</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300 text-star-white" />
                      <span>Initialize Analysis</span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          </div>
          
          {/* Secondary Mission Grid */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {missionData.slice(1).map((mission, index) => {
              const Icon = mission.icon;
              
              return (
                <Link key={mission.title} href={mission.href} className="group block">
                  <article className="card-hologram p-8 h-full hover-lift-tech transition-all duration-300">
                    <div className="flex items-start gap-6 mb-8">
                      <div className="w-16 h-16 bg-electric-green/10 border border-electric-green/30 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-8 w-8 text-electric-green" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-mission-control mb-2">
                          {mission.category}
                        </div>
                        <h3 className="text-headline-3 text-star-white mb-3 group-hover:text-electric-green transition-colors font-orbitron">
                          {mission.title}
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-body-tech mb-8 leading-relaxed text-steel-gray">
                      {mission.description}
                    </p>
                    
                    <div className="border-t border-electric-green/20 pt-6">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gunmetal font-jetbrains tracking-wide">
                          {mission.stats}
                        </div>
                        <div className="flex items-center gap-2 text-electric-green font-semibold group-hover:text-star-white transition-colors">
                          <span>ANALYZE</span>
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

      {/* System Modules Grid */}
      <section className="section-hologram">
        <div className="container-wide">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
            {/* Module Control Header */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="text-mission-control mb-4">SYSTEM MODULES</div>
                <h2 className="text-headline-2 text-star-white mb-6 font-orbitron">
                  Federal<br />
                  Data<br />
                  <span className="text-electric-green">Networks</span>
                </h2>
                <div className="w-24 h-1 bg-electric-green mb-6"></div>
                <p className="text-body-tech text-steel-gray">
                  <strong className="text-star-white">Zero intermediary protocols.</strong> Every data stream 
                  connects directly to federal mainframes. Real-time synchronization with 
                  15+ government agency networks.
                </p>
              </div>
              
              <div className="card-terminal p-6">
                <div className="space-y-2 font-jetbrains text-sm">
                  <div className="text-electric-green/70">$ ping treasury-net.gov</div>
                  <div className="text-electric-green">✓ 64 bytes from treasury-net.gov</div>
                  <div className="text-electric-green/70">$ sync --all-modules --priority=alpha</div>
                  <div className="text-star-white">Synchronizing 15 data networks...</div>
                  <div className="text-electric-green">✓ All modules operational</div>
                  <div className="text-electric-green animate-pulse">█</div>
                </div>
              </div>
            </div>
            
            {/* System Module Cards */}
            <div className="lg:col-span-3 space-y-6">
              {systemModules.map((module, index) => {
                const Icon = module.icon;
                
                return (
                  <Link key={module.name} href={module.href} className="group block">
                    <div className="card-mission-control p-8 hover-lift-tech transition-all duration-300">
                      <div className="grid lg:grid-cols-4 gap-6 items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-electric-green/10 border border-electric-green/30 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-7 w-7 text-electric-green" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xl font-bold text-star-white group-hover:text-electric-green transition-colors font-exo">
                              {module.name}
                            </h3>
                            <div className="text-mission-control text-xs">{module.source}</div>
                          </div>
                        </div>
                        
                        <div className="lg:col-span-2">
                          <p className="text-gunmetal leading-relaxed text-sm">
                            {module.description}
                          </p>
                        </div>
                        
                        <div className="text-right space-y-2">
                          <div className="flex items-center justify-end gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gunmetal" />
                            <span className="text-gunmetal font-jetbrains text-xs">
                              {new Date(module.updated).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="status-online text-sm">
                            {module.status}
                          </div>
                          <div className="flex items-center justify-end gap-2 text-electric-green font-semibold group-hover:text-star-white transition-colors">
                            <span>ACCESS</span>
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

      {/* Mission Protocols */}
      <section className="section-void border-y-4 border-electric-green">
        <div className="container-wide">
          <div className="grid lg:grid-cols-7 gap-16 lg:gap-20 items-start">
            {/* Protocol Documentation */}
            <div className="lg:col-span-4 space-y-12">
              <div>
                <div className="text-mission-control mb-6">SYSTEM PROTOCOLS</div>
                <h2 className="text-headline-1 text-star-white mb-8 font-orbitron">
                  Mission<br />
                  <span className="text-electric-green">Transparency</span><br />
                  <span className="text-mars-orange">Protocols</span>
                </h2>
                <div className="w-32 h-2 bg-gradient-to-r from-electric-green to-mars-orange mb-8"></div>
              </div>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-body-space text-steel-gray mb-8 leading-relaxed">
                  <strong className="text-star-white">Every data point verified through mission protocols.</strong> 
                  Every source authenticated. Every calculation logged in mission archives. 
                  Transparency protocols mandatory for democratic oversight operations.
                </p>
                
                <p className="text-body-tech text-gunmetal">
                  Mission parameters prioritize direct data access over interpretation, 
                  raw intelligence over analysis, and primary sources over secondary reporting. 
                  We are the interface, not the interpreter.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {systemProtocols.map((protocol, index) => {
                  const Icon = protocol.icon;
                  return (
                    <div key={protocol.title} className="card-plasma p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-violet-plasma/20 border border-violet-plasma/30 flex items-center justify-center flex-shrink-0 mt-2">
                          <Icon className="h-6 w-6 text-violet-plasma" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-star-white mb-3 font-orbitron">
                            {protocol.title}
                          </h4>
                          <p className="text-steel-gray leading-relaxed text-sm">
                            {protocol.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Quality Assurance Terminal */}
            <div className="lg:col-span-3">
              <div className="card-hologram p-8 lg:p-10 sticky top-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-electric-green/10 border-2 border-electric-green flex items-center justify-center mx-auto mb-6">
                    <Target className="h-10 w-10 text-electric-green animate-pulse-glow" />
                  </div>
                  <h3 className="text-headline-3 text-star-white mb-2 font-orbitron">
                    Mission Assurance
                  </h3>
                  <div className="text-mission-control">VERIFIED HOURLY</div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 bg-electric-green/5 border border-electric-green/20">
                    <Check className="h-6 w-6 text-electric-green mt-1 flex-shrink-0 animate-pulse-glow" />
                    <div>
                      <div className="font-bold text-star-white mb-1 font-exo">Direct Source Protocol</div>
                      <div className="text-sm text-steel-gray">
                        Every data stream traced to original government mainframe
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-electric-green/5 border border-electric-green/20">
                    <Check className="h-6 w-6 text-electric-green mt-1 flex-shrink-0 animate-pulse-glow" />
                    <div>
                      <div className="font-bold text-star-white mb-1 font-exo">Zero Interpretation Protocol</div>
                      <div className="text-sm text-steel-gray">
                        Pure data interface without political commentary or analysis
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-electric-green/5 border border-electric-green/20">
                    <Check className="h-6 w-6 text-electric-green mt-1 flex-shrink-0 animate-pulse-glow" />
                    <div>
                      <div className="font-bold text-star-white mb-1 font-exo">Open Algorithm Protocol</div>
                      <div className="text-sm text-steel-gray">
                        Complete calculation disclosure and mission audit trail
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-electric-green/5 border border-electric-green/20">
                    <Check className="h-6 w-6 text-electric-green mt-1 flex-shrink-0 animate-pulse-glow" />
                    <div>
                      <div className="font-bold text-star-white mb-1 font-exo">Real-Time Sync Protocol</div>
                      <div className="text-sm text-steel-gray">
                        Automated hourly synchronization with federal networks
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-8 border-t border-electric-green/20 mt-8 text-center">
                  <Award className="h-8 w-8 text-warning-amber mx-auto mb-3 animate-pulse-glow" />
                  <div className="font-bold text-star-white mb-2 font-orbitron">
                    Mission Integrity Certified
                  </div>
                  <div className="text-sm text-steel-gray">
                    Independently verified methodology protocols
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Launch Interface */}
      <section className="section-command-center relative overflow-hidden">
        <div className="container-wide text-center relative z-10">
          <div className="max-w-5xl mx-auto space-y-12">
            <div>
              <div className="text-status-alert inline-block mb-8">MISSION LAUNCH</div>
              <h2 className="text-headline-1 text-star-white mb-8 font-orbitron">
                Government Data<br />
                <span className="text-electric-green">Without</span><br />
                <span className="text-mars-orange">Barriers</span>
              </h2>
              <div className="w-40 h-2 bg-gradient-to-r from-mars-orange via-electric-green to-violet-plasma mx-auto mb-8"></div>
            </div>
            
            <p className="text-2xl lg:text-3xl text-steel-gray mb-16 max-w-4xl mx-auto leading-relaxed">
              <strong className="text-star-white">No clearance required. No cost. No agenda.</strong><br />
              Direct interface access to the data that powers our democracy.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Link href="/debt" className="group">
                <div className="card-terminal p-8 hover-lift-tech transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <Building2 className="h-8 w-8 text-mars-orange" />
                    <div className="text-left">
                      <div className="text-xl font-bold text-star-white font-orbitron">National Debt Crisis</div>
                      <div className="text-sm text-electric-green/70">$34.1 Trillion and accelerating</div>
                    </div>
                  </div>
                  <div className="space-y-2 font-jetbrains text-sm text-left">
                    <div>Per second: <span className="text-mars-orange">+$1,487</span></div>
                    <div>Per citizen: <span className="text-electric-green">$102,847</span></div>
                    <div>Next sync: <span className="text-warning-amber">Live</span></div>
                  </div>
                  <ArrowRight className="h-5 w-5 mt-4 text-star-white group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </Link>
              
              <Link href="/congress" className="group">
                <div className="card-terminal p-8 hover-lift-tech transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <TrendingUp className="h-8 w-8 text-electric-green" />
                    <div className="text-left">
                      <div className="text-xl font-bold text-star-white font-orbitron">Congressional Monitoring</div>
                      <div className="text-sm text-electric-green/70">16,247 transactions analyzed</div>
                    </div>
                  </div>
                  <div className="space-y-2 font-jetbrains text-sm text-left">
                    <div>Entities: <span className="text-electric-green">435</span></div>
                    <div>Conflicts: <span className="text-mars-orange">3 alerts</span></div>
                    <div>Updated: <span className="text-warning-amber">47min ago</span></div>
                  </div>
                  <ArrowRight className="h-5 w-5 mt-4 text-star-white group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </Link>
            </div>
            
            <div className="pt-12">
              <div className="text-lg text-gunmetal mb-4 font-exo">Trusted by analysts, journalists, and citizens</div>
              <div className="flex justify-center gap-8 text-sm text-steel-gray font-jetbrains">
                <span>📊 500K+ monthly users</span>
                <span>⚡ 99.9% system uptime</span>
                <span>🔗 15+ network connections</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Radar Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border border-electric-green rotate-45 animate-pulse"></div>
          <div className="absolute top-32 right-20 w-24 h-24 border border-mars-orange rotate-12 animate-pulse"></div>
          <div className="absolute bottom-20 left-32 w-28 h-28 border border-violet-plasma -rotate-12 animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-20 h-20 border border-electric-green rotate-45 animate-pulse"></div>
        </div>
      </section>

      {/* Network Status Footer */}
      <section className="bg-panel-dark border-t-4 border-electric-green py-16">
        <div className="container-wide">
          <div className="text-center max-w-6xl mx-auto">
            <h4 className="text-2xl font-bold text-star-white mb-8 font-orbitron">
              Federal Network Connections
            </h4>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
              <div className="text-left space-y-4">
                <p className="text-lg text-steel-gray leading-relaxed">
                  Direct integration protocols established with <strong className="text-star-white">15+ federal agencies</strong> 
                  including U.S. Treasury, Department of Homeland Security, Bureau of Labor Statistics, 
                  Office of Management and Budget, and Federal Election Commission networks.
                </p>
                <p className="text-gunmetal">
                  Real-time data synchronization with official government mainframes. 
                  Zero intermediary processing or interpretation protocols.
                </p>
              </div>
              
              <div className="card-terminal p-6">
                <div className="text-mission-control mb-4">NETWORK STATUS</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Treasury-Net</span>
                    <span className="status-online">ONLINE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Congress-Link</span>
                    <span className="status-online">ONLINE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>BLS-Core</span>
                    <span className="status-online">ONLINE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DHS-Net</span>
                    <span className="status-online">ONLINE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FEC-Main</span>
                    <span className="status-online">ONLINE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>OMB-Grid</span>
                    <span className="status-online">ONLINE</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-electric-green/20 pt-8">
              <div className="text-lg text-steel-gray font-space-mono">
                Mission Control operated by{' '}
                <a 
                  href="https://telep.io" 
                  className="text-electric-green hover:text-star-white font-bold transition-colors hover-glow"
                >
                  Telep IO Space Division
                </a>
                {' '}• Last sync: {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short'
                })} • All systems operational
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}