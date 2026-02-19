import { Github, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-50 border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-6">
              <h3 className="text-xl font-serif font-bold text-text-primary mb-2">
                Let&apos;s Talk Statistics
              </h3>
              <p className="caption text-text-muted">
                Government Data • Editorial Rigor
              </p>
            </div>
            <p className="body-small">
              Independent statistical journalism for informed democracy. 
              Every number sourced, every claim verified.
            </p>
          </div>

          {/* Official Sources */}
          <div>
            <h4 className="subheading text-text-primary mb-6">Official Sources</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://fiscaldata.treasury.gov" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="body-small text-text-muted hover:text-editorial-red transition-colors duration-200 flex items-center gap-2 group"
                >
                  Treasury Fiscal Data
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.bls.gov" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="body-small text-text-muted hover:text-editorial-red transition-colors duration-200 flex items-center gap-2 group"
                >
                  Bureau of Labor Statistics
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.dhs.gov" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="body-small text-text-muted hover:text-editorial-red transition-colors duration-200 flex items-center gap-2 group"
                >
                  Homeland Security
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.fec.gov" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="body-small text-text-muted hover:text-editorial-red transition-colors duration-200 flex items-center gap-2 group"
                >
                  Federal Election Commission
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="subheading text-text-primary mb-6">Navigate</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="body-small text-text-muted hover:text-text-primary transition-colors duration-200">
                  Editorial Standards
                </Link>
              </li>
              <li>
                <Link href="/congress" className="body-small text-text-muted hover:text-text-primary transition-colors duration-200">
                  Congressional Trades
                </Link>
              </li>
              <li>
                <Link href="/debt" className="body-small text-text-muted hover:text-text-primary transition-colors duration-200">
                  National Debt Tracker
                </Link>
              </li>
              <li>
                <Link href="/budget" className="body-small text-text-muted hover:text-text-primary transition-colors duration-200">
                  Federal Budget Analysis
                </Link>
              </li>
            </ul>
          </div>

          {/* Transparency */}
          <div>
            <h4 className="subheading text-text-primary mb-6">Transparency</h4>
            <p className="body-small text-text-muted mb-4">
              Open source. Reproducible. Verifiable. 
              All data processing methods disclosed.
            </p>
            <a
              href="https://github.com/JonTelep/lets-talk-statistics"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 body-small text-text-muted hover:text-text-primary transition-colors duration-200 group"
            >
              <Github className="h-4 w-4" />
              View Source Code
              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="section-divider"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="caption text-text-muted mb-2">
              © {currentYear} Let&apos;s Talk Statistics
            </p>
            <p className="body-small text-text-dim">
              Statistical journalism in service of democratic accountability.
            </p>
          </div>
          
          <div className="text-right">
            <p className="caption text-text-muted mb-2">BUILT BY</p>
            <a 
              href="https://telep.io" 
              className="text-editorial-red hover:text-editorial-red-dark transition-colors duration-200 font-serif font-semibold"
            >
              Telep IO
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}