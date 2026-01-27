'use client';

import { useState } from 'react';
import { Search, TrendingUp, TrendingDown, Users } from 'lucide-react';
import Link from 'next/link';

// Mock data - in production this comes from the API
const politicians = [
  { id: 1, name: 'Nancy Pelosi', party: 'D', chamber: 'House', state: 'CA', trades: 142, volume: '$5.2M', avgReturn: '+65.4%', bestTrade: 'NVDA +156%', worstTrade: 'DIS -12%' },
  { id: 2, name: 'Brian Mast', party: 'R', chamber: 'House', state: 'FL', trades: 87, volume: '$2.1M', avgReturn: '+48.2%', bestTrade: 'TSLA +89%', worstTrade: 'INTC -8%' },
  { id: 3, name: 'Austin Scott', party: 'R', chamber: 'House', state: 'GA', trades: 63, volume: '$1.8M', avgReturn: '+42.1%', bestTrade: 'AMD +72%', worstTrade: 'BA -15%' },
  { id: 4, name: 'Josh Gottheimer', party: 'D', chamber: 'House', state: 'NJ', trades: 156, volume: '$4.7M', avgReturn: '+38.7%', bestTrade: 'AAPL +45%', worstTrade: 'META -18%' },
  { id: 5, name: 'Mark Green', party: 'R', chamber: 'House', state: 'TN', trades: 94, volume: '$3.2M', avgReturn: '+35.2%', bestTrade: 'LMT +52%', worstTrade: 'PYPL -22%' },
  { id: 6, name: 'Tommy Tuberville', party: 'R', chamber: 'Senate', state: 'AL', trades: 132, volume: '$6.8M', avgReturn: '+31.8%', bestTrade: 'MSFT +38%', worstTrade: 'NFLX -25%' },
  { id: 7, name: 'Dan Crenshaw', party: 'R', chamber: 'House', state: 'TX', trades: 78, volume: '$1.5M', avgReturn: '+28.4%', bestTrade: 'GOOGL +34%', worstTrade: 'UBER -11%' },
  { id: 8, name: 'Debbie Wasserman Schultz', party: 'D', chamber: 'House', state: 'FL', trades: 45, volume: '$890K', avgReturn: '+24.1%', bestTrade: 'AMZN +31%', worstTrade: 'SNAP -28%' },
  { id: 9, name: 'Michael McCaul', party: 'R', chamber: 'House', state: 'TX', trades: 112, volume: '$8.4M', avgReturn: '+22.6%', bestTrade: 'RTX +29%', worstTrade: 'GE -9%' },
  { id: 10, name: 'Ro Khanna', party: 'D', chamber: 'House', state: 'CA', trades: 34, volume: '$520K', avgReturn: '+18.3%', bestTrade: 'CRM +24%', worstTrade: 'TWTR -35%' },
  { id: 11, name: 'Mark Kelly', party: 'D', chamber: 'Senate', state: 'AZ', trades: 28, volume: '$1.1M', avgReturn: '+15.7%', bestTrade: 'BA +21%', worstTrade: 'SPY -6%' },
  { id: 12, name: 'Kevin Hern', party: 'R', chamber: 'House', state: 'OK', trades: 56, volume: '$2.3M', avgReturn: '+12.4%', bestTrade: 'XOM +18%', worstTrade: 'CVX -7%' },
];

type SortField = 'trades' | 'avgReturn' | 'volume';

export default function PoliticiansPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [partyFilter, setPartyFilter] = useState<'all' | 'D' | 'R'>('all');
  const [chamberFilter, setChamberFilter] = useState<'all' | 'House' | 'Senate'>('all');
  const [sortBy, setSortBy] = useState<SortField>('avgReturn');

  const filteredPoliticians = politicians
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.state.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesParty = partyFilter === 'all' || p.party === partyFilter;
      const matchesChamber = chamberFilter === 'all' || p.chamber === chamberFilter;
      return matchesSearch && matchesParty && matchesChamber;
    })
    .sort((a, b) => {
      if (sortBy === 'trades') return b.trades - a.trades;
      if (sortBy === 'avgReturn') return parseFloat(b.avgReturn) - parseFloat(a.avgReturn);
      if (sortBy === 'volume') {
        const parseVolume = (v: string) => parseFloat(v.replace(/[$KM]/g, '')) * (v.includes('M') ? 1000 : 1);
        return parseVolume(b.volume) - parseVolume(a.volume);
      }
      return 0;
    });

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
          <h1 className="text-3xl font-bold">Politicians by Performance</h1>
          <p className="text-primary-100 mt-2">Track trading activity and returns by member of Congress</p>
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
                placeholder="Search by name or state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Party Filter */}
            <select
              value={partyFilter}
              onChange={(e) => setPartyFilter(e.target.value as 'all' | 'D' | 'R')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Parties</option>
              <option value="D">Democrat</option>
              <option value="R">Republican</option>
            </select>

            {/* Chamber Filter */}
            <select
              value={chamberFilter}
              onChange={(e) => setChamberFilter(e.target.value as 'all' | 'House' | 'Senate')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Chambers</option>
              <option value="House">House</option>
              <option value="Senate">Senate</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="avgReturn">Sort by Return</option>
              <option value="trades">Sort by # Trades</option>
              <option value="volume">Sort by Volume</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPoliticians.map((politician, idx) => (
            <div key={politician.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-gray-300 mr-3">#{idx + 1}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{politician.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                          politician.party === 'D' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {politician.party}
                        </span>
                        <span className="text-sm text-gray-500">{politician.chamber} • {politician.state}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`text-xl font-bold ${
                    politician.avgReturn.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {politician.avgReturn}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Total Trades</p>
                    <p className="font-semibold text-gray-900">{politician.trades}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Volume</p>
                    <p className="font-semibold text-gray-900">{politician.volume}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Best Trade</p>
                    <p className="font-semibold text-green-600">{politician.bestTrade}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Worst Trade</p>
                    <p className="font-semibold text-red-600">{politician.worstTrade}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPoliticians.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm px-6 py-12 text-center text-gray-500">
            No politicians found matching your filters.
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Party Comparison</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Democrats</p>
              <p className="text-3xl font-bold text-blue-600">
                +{(politicians.filter(p => p.party === 'D').reduce((acc, p) => acc + parseFloat(p.avgReturn), 0) / politicians.filter(p => p.party === 'D').length).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500">Avg Return</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Republicans</p>
              <p className="text-3xl font-bold text-red-600">
                +{(politicians.filter(p => p.party === 'R').reduce((acc, p) => acc + parseFloat(p.avgReturn), 0) / politicians.filter(p => p.party === 'R').length).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500">Avg Return</p>
            </div>
          </div>
        </div>

        {/* Data Note */}
        <p className="mt-4 text-sm text-gray-500 text-center">
          Returns are calculated from disclosed trade date to current price. Past performance is not indicative of future results.
          Data from official STOCK Act disclosures.
        </p>
      </div>
    </div>
  );
}
