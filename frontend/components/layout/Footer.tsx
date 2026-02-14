import { 
  Github, ExternalLink, Shield, Database, FileText, Terminal, 
  Satellite, Activity, Zap, Target, Radar, Monitor
} from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-steel-gray-900 text-neon-cyan-200 border-t-2 border-neon-cyan-400 relative">
      {/* Top scanner line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-neon-cyan-400 animate-data-flow"></div>
      
      {/* Mission Control Footer Console */}
      <div className="bg-steel-gray-900 relative overflow-hidden matrix-bg">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-1/4 w-24 h-24 border border-neon-cyan-400 transform rotate-45 animate-mission-pulse"></div>
          <div className="absolute bottom-4 right-1/3 w-16 h-16 border border-cyber-orange-400 transform -rotate-12"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 border border-radar-green-400 transform rotate-12"></div>
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* System Information */}
            <div className="panel-nasa p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-neon-cyan-400 flex items-center justify-center relative">
                  <Shield className="h-6 w-6 text-space-navy-950" />
                  <div className="absolute inset-0 border border-neon-cyan-600 animate-mission-pulse"></div>
                </div>
                <div>
                  <h3 className="mission-text text-lg">
                    SYSTEM INFORMATION
                  </h3>
                  <div className="terminal-text text-xs opacity-60">
                    MISSION_CONTROL_v2.1
                  </div>
                </div>
              </div>
              <p className="text-sm text-neon-cyan-200 leading-relaxed mb-4">
                Direct access pipeline to official U.S. government statistical databases. 
                Zero algorithmic interpretation. Zero editorial modification. 
                Pure data transparency for democratic oversight.
              </p>
              <div className="terminal-text text-xs pt-2 border-t border-steel-gray-700">
                ESTABLISHED: 2024 • STATUS: OPERATIONAL • UPTIME: 99.9%
              </div>
            </div>

            {/* Data Sources Terminal */}
            <div className="panel-console p-6 relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-console-amber-400 animate-data-flow"></div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-console-amber-400 flex items-center justify-center">
                  <Database className="h-6 w-6 text-space-navy-950" />
                </div>
                <div>
                  <h3 className="mission-text text-lg text-console-amber-400">
                    DATA SOURCES
                  </h3>
                  <div className="terminal-text text-xs opacity-60">
                    VERIFIED_GOVERNMENT_FEEDS
                  </div>
                </div>
              </div>
              
              <ul className="space-y-3 text-sm">
                <li className="flex items-center group">
                  <div className="w-2 h-2 bg-radar-green-400 rounded-full mr-3 animate-status-blink"></div>
                  <a
                    href="https://fiscaldata.treasury.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-cyber-orange-400 transition-colors terminal-text flex-1"
                  >
                    TREASURY_FISCAL_DATA
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </li>
                <li className="flex items-center group">
                  <div className="w-2 h-2 bg-radar-green-400 rounded-full mr-3 animate-status-blink"></div>
                  <a
                    href="https://www.bls.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-cyber-orange-400 transition-colors terminal-text flex-1"
                  >
                    BUREAU_LABOR_STATISTICS
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </li>
                <li className="flex items-center group">
                  <div className="w-2 h-2 bg-radar-green-400 rounded-full mr-3 animate-status-blink"></div>
                  <a
                    href="https://www.dhs.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-cyber-orange-400 transition-colors terminal-text flex-1"
                  >
                    HOMELAND_SECURITY_DEPT
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </li>
                <li className="flex items-center group">
                  <div className="w-2 h-2 bg-radar-green-400 rounded-full mr-3 animate-status-blink"></div>
                  <a
                    href="https://www.fec.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-cyber-orange-400 transition-colors terminal-text flex-1"
                  >
                    FEDERAL_ELECTION_COMM
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </li>
                <li className="flex items-center group">
                  <div className="w-2 h-2 bg-radar-green-400 rounded-full mr-3 animate-status-blink"></div>
                  <a
                    href="https://trades.telep.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-cyber-orange-400 transition-colors terminal-text flex-1"
                  >
                    CAPITOL_TRADES_API
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Quick Access Terminal */}
            <div className="panel-radar p-6 relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-radar-green-400 flex items-center justify-center">
                  <Terminal className="h-6 w-6 text-space-navy-950" />
                </div>
                <div>
                  <h3 className="mission-text text-lg text-radar-green-400">
                    QUICK ACCESS
                  </h3>
                  <div className="terminal-text text-xs opacity-60">
                    NAVIGATION_SHORTCUTS
                  </div>
                </div>
              </div>
              
              <ul className="space-y-3 text-sm">
                <li>
                  <Link 
                    href="/about" 
                    className="flex items-center hover:text-cyber-orange-400 transition-colors terminal-text group"
                  >
                    <FileText className="h-4 w-4 mr-3" />
                    METHODOLOGY_&_SOURCES
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/debt" 
                    className="flex items-center hover:text-cyber-orange-400 transition-colors terminal-text group"
                  >
                    <Monitor className="h-4 w-4 mr-3" />
                    DEBT_ANALYSIS_DASHBOARD
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/congress" 
                    className="flex items-center hover:text-cyber-orange-400 transition-colors terminal-text group"
                  >
                    <Activity className="h-4 w-4 mr-3" />
                    CONGRESSIONAL_MONITORING
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/immigration" 
                    className="flex items-center hover:text-cyber-orange-400 transition-colors terminal-text group"
                  >
                    <Radar className="h-4 w-4 mr-3" />
                    IMMIGRATION_TRACKING
                  </Link>
                </li>
                <li>
                  <a
                    href="http://localhost:8000/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-cyber-orange-400 transition-colors terminal-text group"
                  >
                    <Target className="h-4 w-4 mr-3" />
                    API_DOCUMENTATION
                    <ExternalLink className="ml-auto h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Command Footer */}
      <div className="bg-space-navy-950 border-t-2 border-steel-gray-700 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-neon-cyan-400 opacity-50"></div>
        
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                <div className="w-6 h-6 bg-neon-cyan-400 flex items-center justify-center">
                  <Satellite className="h-4 w-4 text-space-navy-950" />
                </div>
                <div className="terminal-text text-sm">
                  © {currentYear} STATISTICAL_ANALYSIS_PLATFORM
                </div>
              </div>
              <p className="text-xs text-steel-gray-400">
                MISSION: DEMOCRATIC_TRANSPARENCY • POWERED_BY:
                <a 
                  href="https://telep.io" 
                  className="text-cyber-orange-400 hover:text-cyber-orange-300 ml-1 font-mono transition-colors"
                >
                  TELEP.IO
                </a>
              </p>
            </div>
            
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              {/* System Status */}
              <div className="panel-nasa px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-radar-green-400 rounded-full animate-status-blink"></div>
                  <span className="terminal-text text-xs">ALL_SYSTEMS_GO</span>
                </div>
              </div>
              
              {/* GitHub Link */}
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/JonTelep/lets-talk-statistics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-steel-gray-800 hover:bg-neon-cyan-400 border border-steel-gray-600 hover:border-neon-cyan-400 flex items-center justify-center transition-all duration-300 group relative"
                >
                  <Github className="h-5 w-5 text-neon-cyan-400 group-hover:text-space-navy-950" />
                  <div className="absolute inset-0 border border-steel-gray-500 group-hover:border-neon-cyan-400 animate-border-scan group-hover:animate-none"></div>
                </a>
                
                <div className="text-xs text-right">
                  <div className="mission-text text-cyber-orange-400">OPEN_SOURCE</div>
                  <div className="terminal-text text-steel-gray-400">VERIFY_EVERYTHING</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom status bar */}
          <div className="mt-6 pt-4 border-t border-steel-gray-800">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-console-amber-400" />
                  <span className="terminal-text">MISSION_TIME: {new Date().toLocaleTimeString()} UTC</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="h-3 w-3 text-neon-cyan-400" />
                  <span className="terminal-text">DATA_FEEDS: 6_ACTIVE</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3 text-radar-green-400" />
                  <span className="terminal-text">SECURITY: ENABLED</span>
                </div>
              </div>
              <div className="terminal-text text-steel-gray-500">
                BUILD: 2024.02.10.RETRO-FUTURISTIC
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}