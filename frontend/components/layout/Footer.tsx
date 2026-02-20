import { Github, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-accent bg-surface-50">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Publication Info */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <h3 className="font-display text-xl font-semibold text-text-primary mb-2">
                Let's Talk Statistics
              </h3>
              <p className="font-mono text-xs text-accent tracking-widest mb-4">
                EST. 2024 • INDEPENDENT ANALYSIS
              </p>
              <p className="text-text-secondary leading-editorial max-w-md">
                Objective analysis of United States government statistics. 
                Every number sourced directly from federal agencies, 
                presented without editorial interpretation.
              </p>
            </div>
            
            <div className="border-l-4 border-accent pl-4">
              <p className="font-display text-lg font-medium text-text-primary mb-2">
                "Data first, conclusions yours."
              </p>
              <p className="font-serif text-text-muted italic">
                — Editorial Mission
              </p>
            </div>
          </div>

          {/* Data Sources */}
          <div>
            <h4 className="font-display text-base font-semibold text-text-primary mb-6 border-b border-border-medium pb-2">
              Primary Sources
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="https://fiscaldata.treasury.gov" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors group">
                  U.S. Treasury Department
                  <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </li>
              <li>
                <a href="https://www.bls.gov" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors group">
                  Bureau of Labor Statistics
                  <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </li>
              <li>
                <a href="https://www.dhs.gov" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors group">
                  Homeland Security Dept.
                  <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </li>
              <li>
                <a href="https://www.fec.gov" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors group">
                  Federal Election Commission
                  <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display text-base font-semibold text-text-primary mb-6 border-b border-border-medium pb-2">
              Analysis Categories
            </h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/debt" className="text-text-secondary hover:text-accent transition-colors">National Debt</Link></li>
              <li><Link href="/congress" className="text-text-secondary hover:text-accent transition-colors">Congressional Trading</Link></li>
              <li><Link href="/employment" className="text-text-secondary hover:text-accent transition-colors">Employment Data</Link></li>
              <li><Link href="/immigration" className="text-text-secondary hover:text-accent transition-colors">Immigration Statistics</Link></li>
              <li><Link href="/about" className="text-text-secondary hover:text-accent transition-colors">Methodology</Link></li>
            </ul>
          </div>
        </div>

        {/* Editorial Divider */}
        <div className="editorial-divider"></div>

        {/* Secondary Footer */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h4 className="font-display text-base font-semibold text-text-primary mb-4">
              Transparency & Verification
            </h4>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              Every statistic on this platform links directly to its government source. 
              All calculations are documented. Complete methodology available for review.
            </p>
            <a
              href="https://github.com/JonTelep/lets-talk-statistics"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-muted transition-colors"
            >
              <Github className="h-4 w-4" />
              View Source Code
            </a>
          </div>

          <div className="md:text-right">
            <div className="mb-4">
              <p className="font-mono text-xs text-text-muted mb-2">
                PUBLISHED BY
              </p>
              <a href="https://telep.io" className="font-display text-lg font-semibold text-text-primary hover:text-accent transition-colors">
                Telep IO
              </a>
            </div>
            <p className="text-xs text-text-muted">
              Independent data analysis platform
            </p>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="font-mono text-xs text-text-muted">
              © {currentYear} Let's Talk Statistics • All data sourced from U.S. government agencies
            </p>
            <p className="font-mono text-xs text-text-muted">
              <Link href="/about" className="hover:text-accent transition-colors">Methodology</Link>
              <span className="mx-2">•</span>
              <a href="mailto:contact@letstalkstatistics.com" className="hover:text-accent transition-colors">Contact</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}