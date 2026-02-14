import Link from 'next/link';
import { 
  Activity, TrendingUp, Users, DollarSign, Briefcase, Building2, 
  ArrowRight, Vote, Shield, Target, Eye, Zap, Radar, Terminal,
  Satellite, BarChart3, PieChart, LineChart, Database
} from 'lucide-react';

const missionCategories = [
  {
    name: 'CONGRESSIONAL TRADING',
    designation: 'CT-001',
    description: 'Monitor real-time stock transactions by legislative personnel under STOCK Act protocols.',
    href: '/congress',
    icon: TrendingUp,
    stats: '435+ TRACKED • REAL-TIME • PERFORMANCE ANALYSIS',
    priority: 'critical',
    status: 'online',
  },
  {
    name: 'IMMIGRATION TRACKING',
    designation: 'IT-002', 
    description: 'DHS data stream analysis: legal migration, deportation metrics, border encounter statistics.',
    href: '/immigration',
    icon: Users,
    stats: 'DHS FEED • HISTORICAL ANALYTICS • GEOGRAPHIC BREAKDOWN',
    priority: 'high',
    status: 'online',
  },
  {
    name: 'FEDERAL BUDGET',
    designation: 'FB-003',
    description: 'USASpending.gov integration: expenditure tracking, agency allocation, deficit monitoring.',
    href: '/budget',
    icon: DollarSign,
    stats: 'TREASURY FEED • AGENCY BREAKDOWN • FISCAL ANALYTICS',
    priority: 'critical',
    status: 'online',
  },
  {
    name: 'EMPLOYMENT METRICS',
    designation: 'EM-004',
    description: 'Bureau of Labor Statistics pipeline: unemployment rates, job growth, workforce analytics.',
    href: '/employment',
    icon: Briefcase,
    stats: 'BLS DATA • STATE RANKINGS • MONTHLY UPDATES',
    priority: 'standard',
    status: 'online',
  },
  {
    name: 'NATIONAL DEBT',
    designation: 'ND-005',
    description: 'Treasury fiscal data: debt tracking, creditor analysis, historical growth patterns.',
    href: '/debt',
    icon: Building2,
    stats: 'TREASURY DIRECT • REAL-TIME • CREDITOR TRACKING',
    priority: 'critical',
    status: 'online',
  },
  {
    name: 'ELECTION FUNDING',
    designation: 'EF-006',
    description: 'FEC database analysis: campaign finance tracking, two-party system metrics.',
    href: '/elections',
    icon: Vote,
    stats: 'FEC DATABASE • PUBLIC FUNDING • BALLOT ACCESS',
    priority: 'standard',
    status: 'online',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Mission Control Header */}
      <section className="relative bg-space-gradient text-white overflow-hidden min-h-screen flex items-center">
        {/* Animated background grid */}
        <div className="absolute inset-0 hex-grid opacity-30"></div>
        
        {/* Floating geometric elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-10 w-32 h-32 border-2 border-neon-cyan-400 transform rotate-45 animate-mission-pulse"></div>
          <div className="absolute top-1/2 right-20 w-24 h-24 border-2 border-cyber-orange-400 transform -rotate-12 animation-delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-40 h-40 border border-radar-green-400 transform rotate-12 animation-delay-2000"></div>
          
          {/* Mission patches */}
          <div className="absolute top-20 right-10 w-16 h-16 bg-steel-gray-800 border border-console-amber-400 rotate-12 flex items-center justify-center">
            <Satellite className="h-8 w-8 text-console-amber-400" />
          </div>
          <div className="absolute bottom-20 left-20 w-20 h-20 bg-space-navy-900 border border-neon-cyan-400 -rotate-6 flex items-center justify-center">
            <Radar className="h-10 w-10 text-neon-cyan-400" />
          </div>
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 z-10">
          <div className="max-w-5xl">
            {/* Mission Badge */}
            <div className="inline-flex items-center gap-3 bg-steel-gray-900 border border-neon-cyan-400 px-6 py-3 text-sm font-bold uppercase tracking-wider mb-8 panel-nasa">
              <div className="status-online"></div>
              <Terminal className="h-4 w-4 text-neon-cyan-400" />
              <span className="terminal-text">MISSION: DATA TRANSPARENCY</span>
            </div>
            
            {/* Main Display */}
            <h1 className="font-display text-display font-black tracking-tight mb-8 leading-none">
              <span className="block">LET'S TALK</span>
              <span className="block holo-text">STATISTICS</span>
            </h1>
            
            {/* Mission Statement Panel */}
            <div className="panel-console p-8 mb-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-console-amber-400 data-stream"></div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-console-amber-400 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-space-navy-950" />
                  </div>
                </div>
                <div>
                  <p className="mission-text text-xl mb-4">
                    OBJECTIVE: GOVERNMENT DATA WITHOUT SPIN
                  </p>
                  <p className="text-lg text-neon-cyan-200 leading-relaxed">
                    Direct access to official U.S. government statistical databases. 
                    Zero editorial interpretation. Zero agenda. Pure data analysis 
                    for democratic transparency.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Launch Controls */}
            <div className="flex flex-wrap gap-6">
              <Link href="/debt" className="btn-mission group">
                <Building2 className="h-5 w-5 mr-3" />
                <span>INITIATE: DEBT ANALYSIS</span>
                <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/congress" className="btn-console group">
                <TrendingUp className="h-5 w-5 mr-3" />
                <span>MONITOR: CONGRESSIONAL TRADING</span>
                <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Status bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-steel-gray-900 border-t border-neon-cyan-400 p-4">
          <div className="mx-auto max-w-7xl flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-radar-green-400 rounded-full animate-status-blink"></div>
                <span className="terminal-text">SYSTEM STATUS: OPERATIONAL</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-console-amber-400" />
                <span className="terminal-text">DATA FEEDS: 6 ACTIVE</span>
              </div>
            </div>
            <div className="terminal-text">
              MISSION TIME: {new Date().toLocaleTimeString()} UTC
            </div>
          </div>
        </div>
      </section>

      {/* Mission Control Console - Data Categories */}
      <section className="bg-space-navy-950 py-20 px-4 sm:px-6 lg:px-8 relative matrix-bg">
        <div className="mx-auto max-w-7xl">
          {/* Control Panel Header */}
          <div className="mb-16">
            <div className="panel-nasa p-8 relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-neon-cyan-400 animate-data-flow"></div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-neon-cyan-400 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-space-navy-950" />
                </div>
                <div>
                  <h2 className="heading-hero mb-2">MISSION DASHBOARD</h2>
                  <p className="terminal-text">ACCESS GOVERNMENT DATA STREAMS</p>
                </div>
              </div>
              <p className="text-xl text-neon-cyan-200 max-w-4xl font-medium">
                Each mission module provides direct pipeline access to official U.S. government data sources. 
                No interpretation algorithms. No manipulation protocols. Pure statistical analysis for democratic oversight.
              </p>
            </div>
          </div>

          {/* Mission Modules Grid */}
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {missionCategories.map((mission, index) => {
              const Icon = mission.icon;
              const isCritical = mission.priority === 'critical';
              
              return (
                <Link key={mission.name} href={mission.href} className="group block">
                  <div className={`
                    ${isCritical ? 'panel-console' : 'panel-nasa'} 
                    h-full p-0 transition-all duration-300 group-hover:scale-105 relative overflow-hidden
                    ${index % 2 === 0 ? 'lg:translate-y-4' : ''}
                  `}>
                    {/* Status indicator */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full animate-status-blink ${
                        isCritical ? 'bg-cyber-orange-400' : 'bg-radar-green-400'
                      }`}></div>
                      <span className="text-xs terminal-text">{mission.status.toUpperCase()}</span>
                    </div>
                    
                    {/* Mission designation header */}
                    <div className={`
                      ${isCritical 
                        ? 'bg-cyber-orange-600 text-space-navy-950' 
                        : 'bg-neon-cyan-600 text-space-navy-950'
                      } 
                      p-6 relative overflow-hidden
                    `}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-8 w-8" />
                          <div>
                            <div className="font-display font-bold text-lg">
                              {mission.designation}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Scanning line effect */}
                      <div className="absolute bottom-0 left-0 right-0 h-px bg-white animate-data-flow"></div>
                    </div>
                    
                    {/* Mission details */}
                    <div className="p-6 space-y-4 relative">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="heading-section text-lg group-hover:text-cyber-orange-400 transition-colors leading-tight">
                          {mission.name}
                        </h3>
                        <div className={`
                          w-8 h-8 border-2 flex items-center justify-center 
                          ${isCritical ? 'border-cyber-orange-400' : 'border-neon-cyan-400'}
                          group-hover:rotate-90 transition-transform
                        `}>
                          <ArrowRight className={`h-4 w-4 ${
                            isCritical ? 'text-cyber-orange-400' : 'text-neon-cyan-400'
                          }`} />
                        </div>
                      </div>
                      
                      <p className="text-neon-cyan-200 text-sm leading-relaxed font-medium">
                        {mission.description}
                      </p>
                      
                      {/* Technical specs */}
                      <div className="pt-4 border-t border-steel-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Terminal className="h-3 w-3 text-console-amber-400" />
                          <span className="data-label text-xs">TECHNICAL SPECIFICATIONS</span>
                        </div>
                        <p className="terminal-text text-xs">
                          {mission.stats}
                        </p>
                      </div>
                    </div>
                    
                    {/* Priority indicator */}
                    {isCritical && (
                      <div className="absolute top-0 right-0">
                        <div className="w-0 h-0 border-l-[30px] border-l-transparent border-t-[30px] border-t-cyber-orange-400"></div>
                        <div className="absolute top-1 right-1">
                          <Zap className="h-4 w-4 text-space-navy-950" />
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* System verification */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-4 panel-nasa p-6">
              <Target className="h-6 w-6 text-radar-green-400" />
              <div className="text-left">
                <div className="mission-text text-lg mb-1">
                  ALL DATA VERIFIED AGAINST SOURCE
                </div>
                <div className="terminal-text text-sm">
                  Direct integration with official U.S. government databases
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NASA Mission Philosophy */}
      <section className="bg-steel-gray-900 py-20 px-4 sm:px-6 lg:px-8 relative">
        {/* Circuit board background pattern */}
        <div className="absolute inset-0 circuit-bg opacity-20"></div>
        
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="heading-hero mb-6 glow-cyan">MISSION PARAMETERS</h2>
            <div className="w-32 h-1 bg-neon-cyan-400 mx-auto shadow-neon-cyan"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Data First Protocol */}
            <div className="panel-radar p-8 group relative">
              <div className="absolute top-4 right-4">
                <div className="text-xs terminal-text">PROTOCOL 01</div>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-radar-green-400 flex items-center justify-center relative">
                  <Database className="h-8 w-8 text-space-navy-950" />
                  <div className="absolute inset-0 border border-radar-green-600 animate-mission-pulse"></div>
                </div>
                <div>
                  <h3 className="heading-section text-radar-green-400 mb-1">
                    DATA FIRST
                  </h3>
                  <div className="terminal-text text-xs">PRIMARY DIRECTIVE</div>
                </div>
              </div>
              
              <p className="text-neon-cyan-200 leading-relaxed mb-6">
                Raw statistical feeds from official government databases. 
                Zero algorithmic interpretation. Zero editorial modification. 
                Zero selective data filtering.
              </p>
              
              <div className="pt-4 border-t border-radar-green-600">
                <div className="terminal-text text-xs">
                  <span className="text-radar-green-400">$</span> SOURCE → DISPLAY → ANALYSIS
                </div>
              </div>
            </div>
            
            {/* Unbiased Analysis */}
            <div className="panel-nasa p-8 group relative md:translate-y-8">
              <div className="absolute top-4 right-4">
                <div className="text-xs terminal-text">PROTOCOL 02</div>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-neon-cyan-400 flex items-center justify-center relative">
                  <Shield className="h-8 w-8 text-space-navy-950" />
                  <div className="absolute inset-0 border border-neon-cyan-600 animate-mission-pulse"></div>
                </div>
                <div>
                  <h3 className="heading-section text-neon-cyan-400 mb-1">
                    UNBIASED
                  </h3>
                  <div className="terminal-text text-xs">NEUTRALITY PROTOCOL</div>
                </div>
              </div>
              
              <p className="text-neon-cyan-200 leading-relaxed mb-6">
                Zero editorial commentary. Zero political interpretation. 
                Statistical analysis presented without contextual bias. 
                User draws conclusions from evidence.
              </p>
              
              <div className="pt-4 border-t border-neon-cyan-600">
                <div className="terminal-text text-xs">
                  <span className="text-neon-cyan-400">$</span> FACTS → USER → CONCLUSIONS
                </div>
              </div>
            </div>
            
            {/* Transparent Methodology */}
            <div className="panel-console p-8 group relative">
              <div className="absolute top-4 right-4">
                <div className="text-xs terminal-text">PROTOCOL 03</div>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-console-amber-400 flex items-center justify-center relative">
                  <Eye className="h-8 w-8 text-space-navy-950" />
                  <div className="absolute inset-0 border border-console-amber-600 animate-mission-pulse"></div>
                </div>
                <div>
                  <h3 className="heading-section text-console-amber-400 mb-1">
                    TRANSPARENT
                  </h3>
                  <div className="terminal-text text-xs">VERIFICATION ENABLED</div>
                </div>
              </div>
              
              <p className="text-neon-cyan-200 leading-relaxed mb-6">
                Direct source linking to government databases. 
                Complete methodology disclosure. Full verification 
                capabilities. Auditable data pathways.
              </p>
              
              <div className="pt-4 border-t border-console-amber-600">
                <div className="terminal-text text-xs">
                  <span className="text-console-amber-400">$</span> SOURCE → METHOD → VERIFY
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Per Capita Analysis Terminal */}
      <section className="bg-space-navy-950 text-white py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 scan-lines pointer-events-none"></div>
        
        <div className="relative mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Terminal Interface */}
            <div>
              <div className="panel-nasa p-8 relative">
                <div className="absolute top-0 left-0 right-0 h-8 bg-steel-gray-800 border-b border-neon-cyan-600 flex items-center px-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-cyber-orange-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-console-amber-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-radar-green-400 rounded-full"></div>
                  </div>
                  <div className="ml-4 terminal-text text-xs">STATISTICAL_ANALYSIS.EXE</div>
                </div>
                
                <div className="pt-8">
                  <div className="mb-6">
                    <div className="mission-text text-lg mb-2">
                      METHODOLOGY: PER CAPITA ANALYSIS
                    </div>
                    <div className="terminal-text text-sm">
                      SYSTEM: STATISTICAL_NORMALIZATION_v2.1
                    </div>
                  </div>
                  
                  <p className="text-lg text-neon-cyan-200 mb-8 leading-relaxed">
                    Essential for fair statistical comparison between regions 
                    with varying population densities. Raw numbers obscure truth. 
                    Proportional analysis reveals accurate patterns.
                  </p>
                  
                  {/* Formula display */}
                  <div className="panel-console p-6 mb-8">
                    <div className="text-center">
                      <div className="data-label mb-3">CALCULATION FORMULA</div>
                      <div className="font-mono text-3xl font-bold text-console-amber-400 mb-4 glow-orange">
                        (COUNT ÷ POPULATION) × 100,000
                      </div>
                      <div className="terminal-text text-sm">
                        = RATE_PER_100K_CITIZENS
                      </div>
                    </div>
                  </div>
                  
                  <div className="terminal-text text-sm">
                    <span className="text-radar-green-400">EXAMPLE:</span> California raw numbers exceed Wyoming by magnitude, 
                    but per capita analysis reveals true per-citizen impact ratios.
                  </div>
                </div>
              </div>
            </div>
            
            {/* Comparative Analysis Display */}
            <div className="space-y-6">
              <h3 className="heading-section text-cyber-orange-400 mb-8 glow-orange">
                COMPARATIVE ANALYSIS MODULE
              </h3>
              
              {/* Region A */}
              <div className="panel-nasa p-6 relative group">
                <div className="absolute top-0 right-0 bg-neon-cyan-400 text-space-navy-950 px-3 py-1 text-xs font-bold">
                  REGION_A
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-neon-cyan-400 flex items-center justify-center">
                    <span className="text-xl text-space-navy-950 font-bold">A</span>
                  </div>
                  <div>
                    <div className="mission-text">METROPOLITAN ZONE</div>
                    <div className="terminal-text text-xs">HIGH_DENSITY_POPULATION</div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="data-label">TOTAL_INCIDENTS</span>
                    <span className="data-value text-neon-cyan-400">10,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="data-label">POPULATION_COUNT</span>
                    <span className="data-value text-neon-cyan-400">10,000,000</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-neon-cyan-600">
                  <div className="flex justify-between items-center">
                    <span className="data-label">PER_CAPITA_RATE</span>
                    <span className="data-value text-lg text-console-amber-400 glow-orange">100 / 100K</span>
                  </div>
                </div>
              </div>
              
              {/* Region B */}
              <div className="panel-console p-6 relative group">
                <div className="absolute top-0 right-0 bg-cyber-orange-400 text-space-navy-950 px-3 py-1 text-xs font-bold">
                  REGION_B
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-cyber-orange-400 flex items-center justify-center">
                    <span className="text-xl text-space-navy-950 font-bold">B</span>
                  </div>
                  <div>
                    <div className="mission-text">RURAL TERRITORY</div>
                    <div className="terminal-text text-xs">LOW_DENSITY_POPULATION</div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="data-label">TOTAL_INCIDENTS</span>
                    <span className="data-value text-cyber-orange-400">500</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="data-label">POPULATION_COUNT</span>
                    <span className="data-value text-cyber-orange-400">100,000</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-cyber-orange-600">
                  <div className="flex justify-between items-center">
                    <span className="data-label">PER_CAPITA_RATE</span>
                    <span className="data-value text-lg text-cyber-orange-400 glow-orange">500 / 100K</span>
                  </div>
                </div>
              </div>
              
              {/* Analysis Result */}
              <div className="panel-radar p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-radar-gradient"></div>
                <div className="relative">
                  <div className="text-center">
                    <div className="mission-text text-2xl mb-2">
                      REGION_B: <span className="text-3xl glow-green">5× HIGHER</span> RATE
                    </div>
                    <div className="terminal-text text-sm">
                      FEWER_ABSOLUTE_INCIDENTS • GREATER_RELATIVE_IMPACT
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Launch CTA */}
      <section className="bg-cyber-gradient py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated geometric background */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 border border-neon-cyan-400 transform rotate-45 animate-mission-pulse"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 border-2 border-cyber-orange-400 transform -rotate-12 animate-mission-pulse"></div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 border border-radar-green-400 transform -translate-x-1/2 -translate-y-1/2 rotate-12 animate-mission-pulse"></div>
        </div>
        
        <div className="relative mx-auto max-w-5xl text-center">
          <h2 className="heading-hero text-white mb-8 glow-cyan">
            INITIATE MISSION
          </h2>
          
          <p className="text-xl text-neon-cyan-200 mb-12 max-w-3xl mx-auto font-medium">
            Select any data stream for immediate analysis. Full access to government statistical databases. 
            Download capabilities enabled. Zero cost. Zero registration required.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <Link href="/debt" className="btn-mission group min-w-[280px]">
              <Building2 className="h-6 w-6 mr-3" />
              <span>LAUNCH: DEBT_ANALYSIS</span>
              <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform" />
            </Link>
            
            <div className="text-neon-cyan-400 font-mono text-sm opacity-75">OR</div>
            
            <Link href="/congress" className="btn-console group min-w-[280px]">
              <TrendingUp className="h-6 w-6 mr-3" />
              <span>MONITOR: CONGRESS_TRADES</span>
              <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
          
          <div className="mt-12 pt-8 border-t border-neon-cyan-400">
            <div className="terminal-text text-sm">
              ALL_DATA_VERIFIED • SOURCES_CITED • METHODS_DISCLOSED
            </div>
          </div>
        </div>
      </section>

      {/* System Attribution Footer */}
      <section className="bg-steel-gray-900 text-neon-cyan-200 py-12 px-4 border-t border-neon-cyan-600">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div>
              <h4 className="mission-text text-lg mb-3">OFFICIAL DATA SOURCES</h4>
              <p className="terminal-text text-sm leading-relaxed">
                Direct integration protocols with U.S. Treasury, Department of Homeland Security, 
                Bureau of Labor Statistics, Office of Management and Budget, Federal Election Commission.
              </p>
            </div>
            
            <div className="text-center">
              <div className="panel-nasa p-4 inline-block">
                <div className="flex items-center gap-3">
                  <Satellite className="h-6 w-6 text-neon-cyan-400" />
                  <div>
                    <div className="mission-text text-sm">SYSTEM DEVELOPED BY</div>
                    <a 
                      href="https://telep.io" 
                      className="text-cyber-orange-400 hover:text-cyber-orange-300 font-bold transition-colors glow-orange"
                    >
                      TELEP.IO
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <h4 className="mission-text text-lg mb-3">MISSION PARAMETERS</h4>
              <div className="terminal-text text-sm space-y-1">
                <div>STATUS: OPERATIONAL</div>
                <div>UPTIME: 99.9%</div>
                <div>FEEDS: 6 ACTIVE</div>
                <div>ACCESS: UNRESTRICTED</div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-steel-gray-700 text-center">
            <div className="terminal-text text-xs">
              STATISTICAL_ANALYSIS • DEMOCRATIC_TRANSPARENCY • DATA_LIBERATION
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}