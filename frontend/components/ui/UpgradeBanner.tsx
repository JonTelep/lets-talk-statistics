'use client';

import Link from 'next/link';
import { Crown, Sparkles, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';

interface UpgradeBannerProps {
  variant?: 'inline' | 'sticky' | 'card';
  dismissible?: boolean;
}

export function UpgradeBanner({ variant = 'inline', dismissible = true }: UpgradeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (variant === 'sticky') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-federal-gold-500 border-t-4 border-federal-navy-900">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-federal-navy-900" />
              <p className="text-federal-navy-900 font-semibold">
                <span className="hidden sm:inline">Unlock full historical data, exports, and API access. </span>
                <span className="font-bold">Try Pro free for 14 days →</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 bg-federal-navy-900 text-white px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-federal-navy-800 transition-colors"
              >
                Upgrade Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              
              {dismissible && (
                <button
                  onClick={() => setDismissed(true)}
                  className="p-1 text-federal-navy-900 hover:bg-federal-gold-600 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="bg-gradient-to-r from-federal-navy-900 to-federal-navy-800 text-white p-6 shadow-brutal relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-federal-gold-500 transform rotate-45 translate-x-16 -translate-y-16 opacity-20"></div>
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-federal-gold-400" />
            <span className="text-federal-gold-400 font-bold uppercase tracking-wider text-sm">Pro Features</span>
          </div>
          
          <h3 className="text-xl font-serif font-bold mb-2">Unlock More Power</h3>
          
          <ul className="text-sm text-federal-navy-100 space-y-1 mb-4">
            <li>✓ Full 10+ years of historical data</li>
            <li>✓ CSV, Excel, and PDF exports</li>
            <li>✓ API access for integrations</li>
            <li>✓ Custom dashboards & alerts</li>
          </ul>
          
          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 bg-federal-gold-500 text-federal-navy-900 px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-federal-gold-400 transition-colors shadow-brutal-gold"
            >
              <Crown className="h-4 w-4" />
              Try Pro Free
            </Link>
            <span className="text-xs text-federal-navy-300">14-day trial</span>
          </div>
        </div>
        
        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 p-1 text-federal-navy-300 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  // Default: inline banner
  return (
    <div className="bg-federal-gold-100 border-2 border-federal-gold-500 p-4 flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-federal-gold-500 p-2">
          <Crown className="h-5 w-5 text-federal-navy-900" />
        </div>
        <div>
          <p className="font-semibold text-federal-navy-900">Want more features?</p>
          <p className="text-sm text-federal-charcoal-600">
            Upgrade to Pro for exports, full history, and API access.
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 bg-federal-gold-500 text-federal-navy-900 px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-federal-gold-400 transition-colors"
        >
          See Plans
          <ArrowRight className="h-4 w-4" />
        </Link>
        
        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-federal-charcoal-600 hover:text-federal-navy-900"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default UpgradeBanner;
