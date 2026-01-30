'use client';

import { useState, useEffect } from 'react';
import { Search, TrendingUp, Users, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Trader {
  name: string;
  trades: number;
  chamber: string;
}

export default function PoliticiansPage() {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchTraders() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/api/v1/congress/traders?limit=50`);
        if (!response.ok) throw new Error('Failed to fetch traders');
        
        const data = await response.json();
        setTraders(data);
      } catch (err) {
        console.error('Error fetching traders:', err);
        setError('Failed to load politicians data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchTraders();
  }, []);

  const filteredTraders = traders.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading politicians data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Data Unavailable</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-primary-200 mb-2">
            <Link href="/congress" className="hover:text-white">Congressional Trading</Link>
            <span>/</span>
            <span>Politicians</span>
          </div>
          <h1 className="text-3xl font-bold">Politicians by Trading Activity</h1>
          <p className="text-primary-100 mt-2">Track trading activity by members of Congress (Senate)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTraders.map((trader, idx) => (
            <div key={trader.name} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-gray-300 mr-3">#{idx + 1}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{trader.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                          S
                        </span>
                        <span className="text-sm text-gray-500">{trader.chamber}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>Total Trades</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">{trader.trades}</span>
                </div>

                <Link 
                  href={`/congress/trades?politician=${encodeURIComponent(trader.name.split(' ')[1] || trader.name)}`}
                  className="mt-4 block text-center text-sm text-primary-600 hover:text-primary-700"
                >
                  View Trades →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredTraders.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm px-6 py-12 text-center text-gray-500">
            No politicians found matching your search.
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Politicians</p>
              <p className="text-3xl font-bold text-gray-900">{traders.length}</p>
              <p className="text-sm text-gray-500">with disclosed trades</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-3xl font-bold text-gray-900">
                {traders.reduce((sum, t) => sum + t.trades, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">across all senators</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Most Active</p>
              <p className="text-xl font-bold text-gray-900">{traders[0]?.name || 'N/A'}</p>
              <p className="text-sm text-gray-500">{traders[0]?.trades || 0} trades</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-800 mb-2">Coming Soon</h4>
          <p className="text-sm text-amber-700">
            Performance metrics (returns, best/worst trades) will be added once we integrate 
            historical stock price data. Currently showing trade activity only.
          </p>
        </div>

        {/* Data Note */}
        <p className="mt-4 text-sm text-gray-500 text-center">
          Data from official Senate STOCK Act disclosures. House data coming soon.
        </p>
      </div>
    </div>
  );
}
