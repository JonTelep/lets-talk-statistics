'use client';

import { useState, useEffect } from 'react';
import { Search, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import Spinner from '@/components/ui/Spinner';

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

interface Trader { name: string; trades: number; chamber: string; }

export default function PoliticiansPage() {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchTraders() {
      try {
        setLoading(true); setError(null);
        const response = await fetch(`${API_URL}/congress/traders?limit=50`);
        if (!response.ok) throw new Error('Failed to fetch traders');
        setTraders(await response.json());
      } catch (err) { setError('Failed to load politicians data.'); }
      finally { setLoading(false); }
    }
    fetchTraders();
  }, []);

  const filteredTraders = traders.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-surface-500">Loading politicians data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Data Unavailable</h2>
          <p className="text-surface-500 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-secondary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-surface-600 text-sm mb-4">
            <Link href="/congress" className="hover:text-surface-300 transition-colors">Congressional Trading</Link>
            <span>/</span>
            <span className="text-surface-400">Politicians</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Politicians by Trading Activity</h1>
          <p className="text-lg text-surface-500">Track trading activity by members of Congress</p>
        </div>
      </div>

      {/* Search */}
      <div className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
        <div className="card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-surface-600" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-800 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTraders.map((trader, idx) => (
            <div key={trader.name} className="card card-hover p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-surface-700 mr-3 font-mono">#{idx + 1}</span>
                  <div>
                    <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>{trader.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400">S</span>
                      <span className="text-sm text-surface-500">{trader.chamber}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm border-t border-border pt-4">
                <div className="flex items-center gap-2 text-surface-500"><TrendingUp className="h-4 w-4" />Total Trades</div>
                <span className="font-bold font-mono text-lg" style={{ color: 'var(--text-primary)' }}>{trader.trades}</span>
              </div>
              <Link href={`/congress/trades?politician=${encodeURIComponent(trader.name.split(' ')[1] || trader.name)}`} className="mt-4 block text-center text-sm text-accent hover:underline">
                View Trades →
              </Link>
            </div>
          ))}
        </div>

        {filteredTraders.length === 0 && (
          <div className="card px-6 py-12 text-center text-surface-600">No politicians found matching your search.</div>
        )}

        {/* Summary */}
        <div className="mt-8 card p-6">
          <h3 className="text-base font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Overview</h3>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { label: 'Total Politicians', value: traders.length, sub: 'with disclosed trades' },
              { label: 'Total Transactions', value: traders.reduce((sum, t) => sum + t.trades, 0).toLocaleString(), sub: 'across all senators' },
              { label: 'Most Active', value: traders[0]?.name || 'N/A', sub: `${traders[0]?.trades || 0} trades` },
            ].map(({ label, value, sub }) => (
              <div key={label} className="p-4 bg-surface-800 rounded-lg">
                <p className="text-sm text-surface-500">{label}</p>
                <p className="text-2xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{value}</p>
                <p className="text-sm text-surface-600">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 text-sm text-surface-600 text-center">
          Data from official Senate STOCK Act disclosures. House data coming soon.
        </p>
      </div>
    </div>
  );
}
