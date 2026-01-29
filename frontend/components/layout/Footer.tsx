import { Github, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Let's Talk Statistics
            </h3>
            <p className="text-sm text-gray-400">
              An objective platform for exploring US government statistics.
              No opinions, just data.
            </p>
          </div>

          {/* Data Sources */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Data Sources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://cde.ucr.cjis.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-primary-400 transition-colors"
                >
                  FBI Crime Data Explorer
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://bjs.ojp.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-primary-400 transition-colors"
                >
                  Bureau of Justice Statistics
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.census.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-primary-400 transition-colors"
                >
                  US Census Bureau
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-primary-400 transition-colors">
                  About & Methodology
                </Link>
              </li>
              <li>
                <Link href="/debt" className="hover:text-primary-400 transition-colors">
                  National Debt
                </Link>
              </li>
              <li>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-primary-400 transition-colors"
                >
                  API Documentation
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-primary-400 transition-colors"
                >
                  <Github className="mr-1 h-4 w-4" />
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
          <p>
            © {currentYear} Let's Talk Statistics. Data from US government sources.
          </p>
          <p className="mt-2 text-gray-500">
            This is an educational project. All data is sourced from official government agencies.
          </p>
        </div>
      </div>
    </footer>
  );
}
