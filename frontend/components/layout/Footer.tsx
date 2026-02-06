import { Github, ExternalLink, Shield, Database, FileText } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-federal-navy-950 text-gray-300 border-t-4 border-federal-gold-500">
      {/* Top section with geometric accent */}
      <div className="bg-federal-navy-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-32 h-32 border-2 border-federal-gold-400 transform rotate-45"></div>
          <div className="absolute bottom-0 right-1/3 w-24 h-24 border-2 border-federal-red-400 transform -rotate-12"></div>
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-federal-gold-500 border border-federal-navy-700 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-federal-navy-900" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-white">
                  Government Data Portal
                </h3>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Direct access to official U.S. government statistics. 
                Objective analysis without editorial interpretation. 
                Transparent methodology with full source attribution.
              </p>
            </div>

            {/* Data Sources */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-federal-red-600 border border-federal-navy-700 flex items-center justify-center">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-white">Official Sources</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="https://fiscaldata.treasury.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-federal-gold-400 transition-colors font-mono"
                  >
                    Treasury Fiscal Data
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.bls.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-federal-gold-400 transition-colors font-mono"
                  >
                    Bureau of Labor Statistics
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.dhs.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-federal-gold-400 transition-colors font-mono"
                  >
                    Department of Homeland Security
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.fec.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-federal-gold-400 transition-colors font-mono"
                  >
                    Federal Election Commission
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Quick Access */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-federal-charcoal-600 border border-federal-navy-700 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-white">Quick Access</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/about" className="hover:text-federal-gold-400 transition-colors font-mono">
                    Methodology & Sources
                  </Link>
                </li>
                <li>
                  <Link href="/debt" className="hover:text-federal-gold-400 transition-colors font-mono">
                    National Debt Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/congress" className="hover:text-federal-gold-400 transition-colors font-mono">
                    Congressional Trading
                  </Link>
                </li>
                <li>
                  <a
                    href="http://localhost:8000/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-federal-gold-400 transition-colors font-mono"
                  >
                    API Documentation
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="bg-federal-navy-950 border-t border-federal-charcoal-800">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left">
              <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                © {currentYear} Statistical Analysis Platform
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Built for democratic transparency • Funded by 
                <a href="https://telep.io" className="text-federal-gold-400 hover:text-federal-gold-300 ml-1">
                  Telep IO
                </a>
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <a
                href="https://github.com/JonTelep/lets-talk-statistics"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-federal-charcoal-700 hover:bg-federal-gold-500 border border-federal-charcoal-600 flex items-center justify-center transition-colors group"
              >
                <Github className="h-4 w-4 text-gray-400 group-hover:text-federal-navy-900" />
              </a>
              
              <div className="text-xs text-right">
                <p className="font-mono text-federal-gold-400">OPEN SOURCE</p>
                <p className="text-gray-500">Verify Everything</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
