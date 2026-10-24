import { Github } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-medium text-foreground mb-4">Publishers</h3>
            <ul className="space-y-2 text-sm text-surface-500">
              <li><a href="https://www.bls.gov" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Bureau of Labor Statistics</a></li>
              <li><a href="https://fiscaldata.treasury.gov" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Treasury Fiscal Data</a></li>
              <li><a href="https://www.whitehouse.gov/omb/information-resources/budget/historical-tables/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Office of Management and Budget</a></li>
              <li><a href="https://www.bea.gov" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Bureau of Economic Analysis</a></li>
              <li><a href="https://www.census.gov" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">U.S. Census Bureau</a></li>
              <li><a href="https://ohss.dhs.gov" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Office of Homeland Security Statistics</a></li>
              <li><a href="https://www.cbp.gov" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">U.S. Customs and Border Protection</a></li>
              <li><a href="https://www.eia.gov" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">U.S. Energy Information Administration</a></li>
              <li><a href="https://data.worldbank.org" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">World Bank</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground mb-4">Pages</h3>
            <ul className="space-y-2 text-sm text-surface-500">
              <li><Link href="/prices" className="hover:text-foreground transition-colors">Prices and inflation</Link></li>
              <li><Link href="/budget" className="hover:text-foreground transition-colors">Federal budget and debt</Link></li>
              <li><Link href="/economy" className="hover:text-foreground transition-colors">Economy and wages</Link></li>
              <li><Link href="/energy" className="hover:text-foreground transition-colors">Energy</Link></li>
              <li><Link href="/crime" className="hover:text-foreground transition-colors">Crime</Link></li>
              <li><Link href="/immigration" className="hover:text-foreground transition-colors">Immigration</Link></li>
              <li><Link href="/sources" className="hover:text-foreground transition-colors">Sources and methodology</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground mb-4">Files</h3>
            <p className="text-sm text-surface-500 mb-4">
              Every chart value is produced by a script in this repository from a saved government file.
            </p>
            <a
              href="https://github.com/JonTelep/lets-talk-statistics"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-surface-600">
            © {currentYear} Let&apos;s Talk Statistics
          </p>
          <p className="text-xs text-surface-600">
            Official statistics, cited on each chart.
          </p>
        </div>
      </div>
    </footer>
  );
}
