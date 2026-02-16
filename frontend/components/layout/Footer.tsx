import { Github } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-medium text-white mb-4">Data Sources</h3>
            <ul className="space-y-2 text-sm text-surface-500">
              <li><a href="https://fiscaldata.treasury.gov" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Treasury Fiscal Data</a></li>
              <li><a href="https://www.bls.gov" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Bureau of Labor Statistics</a></li>
              <li><a href="https://www.dhs.gov" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Dept. of Homeland Security</a></li>
              <li><a href="https://www.fec.gov" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Federal Election Commission</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-white mb-4">Navigate</h3>
            <ul className="space-y-2 text-sm text-surface-500">
              <li><Link href="/about" className="hover:text-white transition-colors">About &amp; Methodology</Link></li>
              <li><Link href="/debt" className="hover:text-white transition-colors">National Debt</Link></li>
              <li><Link href="/congress" className="hover:text-white transition-colors">Congressional Trading</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-white mb-4">Open Source</h3>
            <p className="text-sm text-surface-500 mb-4">
              All data sourced from official U.S. government agencies. Verify everything.
            </p>
            <a
              href="https://github.com/JonTelep/lets-talk-statistics"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-white transition-colors"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-surface-600">
            © {currentYear} Let&apos;s Talk Statistics · Built by{' '}
            <a href="https://telep.io" className="text-surface-400 hover:text-white transition-colors">Telep IO</a>
          </p>
          <p className="text-xs text-surface-600">
            Government data, clearly presented.
          </p>
        </div>
      </div>
    </footer>
  );
}
