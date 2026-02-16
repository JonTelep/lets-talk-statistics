import { 
  Github, ExternalLink, Shield, Database, FileText, Clock,
  BarChart3, MapPin, Award, Check, Radio, Satellite, Monitor, Zap
} from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-deep-space border-t border-electric-green/30 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="container-command py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Mission Control Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-electric-green/20 border-2 border-electric-green flex items-center justify-center relative overflow-hidden">
                <Database className="h-7 w-7 text-electric-green animate-pulse-glow" />
                <div className="absolute inset-0 bg-electric-green/10 animate-scanner-sweep"></div>
              </div>
              <div>
                <h3 className="font-orbitron text-xl font-bold text-star-white">
                  MISSION CONTROL
                </h3>
                <div className="text-mission-control text-xs">
                  DATA SYSTEMS • CLASSIFIED
                </div>
              </div>
            </div>
            <p className="text-steel-gray leading-relaxed mb-6 max-w-lg font-space-mono">
              Advanced interface to official U.S. government statistical mainframes. 
              Zero political filters. Zero agenda protocols. Pure data intelligence 
              for enhanced democratic oversight operations.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-electric-green rounded-full animate-pulse-glow"></div>
                <span className="text-electric-green font-jetbrains">NETWORK ACTIVE</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-electric-green" />
                <span className="text-steel-gray font-jetbrains">SOURCES VERIFIED</span>
              </div>
            </div>
          </div>

          {/* Federal Network Sources */}
          <div>
            <h4 className="font-orbitron text-lg font-semibold text-star-white mb-6">
              Network Connections
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://fiscaldata.treasury.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-steel-gray hover:text-electric-green transition-colors group font-space-mono"
                >
                  <span className="text-xs mr-2 text-electric-green/70">TREASURY-NET:</span>
                  U.S. Treasury
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.bls.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-steel-gray hover:text-electric-green transition-colors group font-space-mono"
                >
                  <span className="text-xs mr-2 text-electric-green/70">BLS-CORE:</span>
                  Bureau of Labor Statistics
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.dhs.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-steel-gray hover:text-electric-green transition-colors group font-space-mono"
                >
                  <span className="text-xs mr-2 text-electric-green/70">DHS-NET:</span>
                  Homeland Security
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.fec.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-steel-gray hover:text-electric-green transition-colors group font-space-mono"
                >
                  <span className="text-xs mr-2 text-electric-green/70">FEC-MAIN:</span>
                  Federal Election Commission
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://trades.telep.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-steel-gray hover:text-electric-green transition-colors group font-space-mono"
                >
                  <span className="text-xs mr-2 text-electric-green/70">TRADES-API:</span>
                  Capitol Trades Interface
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Access Modules */}
          <div>
            <h4 className="font-orbitron text-lg font-semibold text-star-white mb-6">
              Quick Access
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link 
                  href="/about" 
                  className="text-steel-gray hover:text-electric-green transition-colors font-exo hover-glow"
                >
                  Mission Parameters & Sources
                </Link>
              </li>
              <li>
                <Link 
                  href="/debt" 
                  className="text-steel-gray hover:text-electric-green transition-colors font-exo hover-glow"
                >
                  National Debt Monitor
                </Link>
              </li>
              <li>
                <Link 
                  href="/congress" 
                  className="text-steel-gray hover:text-electric-green transition-colors font-exo hover-glow"
                >
                  Congressional Trading Protocol
                </Link>
              </li>
              <li>
                <Link 
                  href="/immigration" 
                  className="text-steel-gray hover:text-electric-green transition-colors font-exo hover-glow"
                >
                  Immigration Data Matrix
                </Link>
              </li>
              <li>
                <a
                  href="/api/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-steel-gray hover:text-electric-green transition-colors font-exo hover-glow"
                >
                  API Interface Documentation
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mission Protocols Section */}
      <div className="border-t border-electric-green/20 bg-panel-dark/50">
        <div className="container-command py-12 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h4 className="font-orbitron text-lg font-semibold text-star-white mb-4">
                Mission Protocols
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-electric-green mt-0.5 flex-shrink-0 animate-pulse-glow" />
                  <div>
                    <div className="text-sm font-medium text-star-white font-exo">Direct Source Protocol</div>
                    <div className="text-xs text-gunmetal font-jetbrains">Every data stream traced to origin</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-electric-green mt-0.5 flex-shrink-0 animate-pulse-glow" />
                  <div>
                    <div className="text-sm font-medium text-star-white font-exo">Zero Interpretation Protocol</div>
                    <div className="text-xs text-gunmetal font-jetbrains">No political bias or opinion</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-electric-green mt-0.5 flex-shrink-0 animate-pulse-glow" />
                  <div>
                    <div className="text-sm font-medium text-star-white font-exo">Open Algorithm Protocol</div>
                    <div className="text-xs text-gunmetal font-jetbrains">Calculations fully disclosed</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-electric-green mt-0.5 flex-shrink-0 animate-pulse-glow" />
                  <div>
                    <div className="text-sm font-medium text-star-white font-exo">Real-Time Sync Protocol</div>
                    <div className="text-xs text-gunmetal font-jetbrains">Hourly sync with federal networks</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-hologram p-6">
              <div className="text-center">
                <Award className="h-8 w-8 text-warning-amber mx-auto mb-4 animate-pulse-glow" />
                <h5 className="font-orbitron font-semibold text-star-white mb-2">
                  Mission Transparency Protocol
                </h5>
                <p className="text-sm text-steel-gray font-space-mono">
                  Every data point, every calculation, every source available for verification. 
                  Democratic oversight requires transparency protocols.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status Footer */}
      <div className="border-t border-electric-green/20 bg-deep-space">
        <div className="container-command py-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                <div className="w-6 h-6 bg-electric-green/20 border border-electric-green flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-electric-green" />
                </div>
                <div className="text-sm text-steel-gray font-jetbrains">
                  © {currentYear} MISSION CONTROL DATA SYSTEMS
                </div>
              </div>
              <p className="text-xs text-gunmetal font-space-mono">
                Operated by{' '}
                <a 
                  href="https://telep.io" 
                  className="text-electric-green hover:text-star-white transition-colors hover-glow"
                >
                  Telep IO Space Division
                </a>
                {' '}• Committed to democratic transparency protocols
              </p>
            </div>
            
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              {/* System Status */}
              <div className="flex items-center gap-2 text-sm">
                <Radio className="h-4 w-4 text-electric-green animate-pulse-glow" />
                <span className="text-steel-gray font-jetbrains">
                  SYNC: {new Date().toLocaleDateString().toUpperCase()}
                </span>
              </div>
              
              {/* GitHub Interface */}
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/JonTelep/lets-talk-statistics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-electric-green/10 border border-electric-green/30 hover:bg-electric-green/20 hover:border-electric-green flex items-center justify-center transition-all duration-300 group hover-lift-tech"
                >
                  <Github className="h-5 w-5 text-electric-green group-hover:text-star-white" />
                </a>
                
                <div className="text-xs text-right">
                  <div className="text-electric-green font-medium font-orbitron">OPEN SOURCE</div>
                  <div className="text-gunmetal font-jetbrains">VERIFY EVERYTHING</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mission Status Display */}
          <div className="mt-6 pt-4 border-t border-electric-green/30">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Satellite className="h-3 w-3 text-electric-green animate-pulse-glow" />
                  <span className="text-steel-gray font-jetbrains">WASHINGTON, D.C. • FEDERAL NETWORK GRID</span>
                </div>
                <div className="flex items-center gap-2">
                  <Monitor className="h-3 w-3 text-electric-green" />
                  <span className="text-steel-gray font-jetbrains">15+ ACTIVE CONNECTIONS</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-warning-amber animate-pulse-glow" />
                  <span className="status-online">ALL SYSTEMS OPERATIONAL</span>
                </div>
              </div>
              <div className="text-gunmetal font-jetbrains">
                MISSION BUILD: {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit' 
                }).replace(/\//g, '.')} • RETRO-FUTURISTIC INTERFACE
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}