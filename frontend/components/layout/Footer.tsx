import { 
  Github, ExternalLink, Shield, Database, FileText, Clock,
  BarChart3, MapPin, Award, Check
} from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-editorial-dark text-white">      
      <div className="container-editorial py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* About */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-editorial-accent flex items-center justify-center">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">
                  Let's Talk Statistics
                </h3>
                <div className="text-sm text-editorial-gold">
                  Government Data • Transparent
                </div>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed mb-6 max-w-lg">
              Direct access to official U.S. government statistical databases. 
              No editorial interpretation. No political agenda. Pure data analysis 
              for informed democratic participation.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-editorial-forest rounded-full"></div>
                <span>Data feeds active</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Sources verified</span>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-6">
              Official Sources
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://fiscaldata.treasury.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-300 hover:text-editorial-gold transition-colors group"
                >
                  U.S. Treasury
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.bls.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-300 hover:text-editorial-gold transition-colors group"
                >
                  Bureau of Labor Statistics
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.dhs.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-300 hover:text-editorial-gold transition-colors group"
                >
                  Department of Homeland Security
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.fec.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-300 hover:text-editorial-gold transition-colors group"
                >
                  Federal Election Commission
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://trades.telep.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-300 hover:text-editorial-gold transition-colors group"
                >
                  Capitol Trades API
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-6">
              Quick Access
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link 
                  href="/about" 
                  className="text-gray-300 hover:text-editorial-gold transition-colors"
                >
                  Methodology & Sources
                </Link>
              </li>
              <li>
                <Link 
                  href="/debt" 
                  className="text-gray-300 hover:text-editorial-gold transition-colors"
                >
                  National Debt Tracker
                </Link>
              </li>
              <li>
                <Link 
                  href="/congress" 
                  className="text-gray-300 hover:text-editorial-gold transition-colors"
                >
                  Congressional Trading
                </Link>
              </li>
              <li>
                <Link 
                  href="/immigration" 
                  className="text-gray-300 hover:text-editorial-gold transition-colors"
                >
                  Immigration Data
                </Link>
              </li>
              <li>
                <a
                  href="/api/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-300 hover:text-editorial-gold transition-colors"
                >
                  API Documentation
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Editorial Standards */}
      <div className="border-t border-editorial-navy/50 bg-editorial-dark/50">
        <div className="container-editorial py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h4 className="font-serif text-lg font-semibold text-white mb-4">
                Editorial Standards
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-editorial-forest mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-white">Direct Source Linking</div>
                    <div className="text-xs text-gray-400">Every statistic traceable to origin</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-editorial-forest mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-white">Zero Editorial Bias</div>
                    <div className="text-xs text-gray-400">No interpretation or opinion</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-editorial-forest mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-white">Open Methodology</div>
                    <div className="text-xs text-gray-400">Calculations fully disclosed</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-editorial-forest mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-white">Real-Time Updates</div>
                    <div className="text-xs text-gray-400">Daily sync with government feeds</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-editorial p-6">
              <div className="text-center">
                <Award className="h-8 w-8 text-editorial-gold mx-auto mb-4" />
                <h5 className="font-serif font-semibold text-editorial-dark mb-2">
                  Commitment to Transparency
                </h5>
                <p className="text-sm text-editorial-gray">
                  Every data point, every calculation, every source is open for verification. 
                  Democracy requires transparency, and transparency requires accessible data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-editorial-navy/50 bg-editorial-dark">
        <div className="container-editorial py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                <div className="w-6 h-6 bg-editorial-accent flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <div className="text-sm text-gray-300">
                  © {currentYear} Let's Talk Statistics
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Powered by{' '}
                <a 
                  href="https://telep.io" 
                  className="text-editorial-gold hover:text-editorial-accent transition-colors"
                >
                  Telep IO
                </a>
                {' '}• Committed to democratic transparency
              </p>
            </div>
            
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              {/* Status indicator */}
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Clock className="h-4 w-4" />
                <span>Updated {new Date().toLocaleDateString()}</span>
              </div>
              
              {/* GitHub Link */}
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/JonTelep/lets-talk-statistics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-editorial-navy hover:bg-editorial-accent border border-editorial-navy/50 hover:border-editorial-accent flex items-center justify-center transition-all duration-300 group"
                >
                  <Github className="h-5 w-5 text-gray-300 group-hover:text-white" />
                </a>
                
                <div className="text-xs text-right">
                  <div className="text-editorial-gold font-medium">Open Source</div>
                  <div className="text-gray-400">Verify Everything</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Last updated */}
          <div className="mt-6 pt-4 border-t border-editorial-navy/30">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  <span>Washington, D.C. • Federal Data Sources</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="h-3 w-3" />
                  <span>6 Active Feeds</span>
                </div>
              </div>
              <div>
                Last Build: {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit' 
                })} • Editorial Design
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}