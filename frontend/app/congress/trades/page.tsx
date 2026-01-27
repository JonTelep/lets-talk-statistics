'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Search, Filter, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';

// Mock data - in production this comes from the API
const allTrades = [
  { id: 1, politician: 'Nancy Pelosi', party: 'D', chamber: 'House', state: 'CA', stock: 'NVDA', ticker: 'NVDA', company: 'NVIDIA Corp', type: 'Buy', amount: '$1M - $5M', date: '2025-01-20', filedDate: '2025-01-25', return: '+15.2%' },
  { id: 2, politician: 'Dan Crenshaw', party: 'R', chamber: 'House', state: 'TX', stock: 'MSFT', ticker: 'MSFT', company: 'Microsoft Corp', type: 'Sell', amount: '$100K - $250K', date: '2025-01-18', filedDate: '2025-01-22', return: '+8.4%' },
  { id: 3, politician: 'Josh Gottheimer', party: 'D', chamber: 'House', state: 'NJ', stock: 'AAPL', ticker: 'AAPL', company: 'Apple Inc', type: 'Buy', amount: '$50K - $100K', date: '2025-01-15', filedDate: '2025-01-20', return: '+3.1%' },
  { id: 4, politician: 'Marjorie Taylor Greene', party: 'R', chamber: 'House', state: 'GA', stock: 'TSLA', ticker: 'TSLA', company: 'Tesla Inc', type: 'Buy', amount: '$15K - $50K', date: '2025-01-14', filedDate: '2025-01-19', return: '-2.8%' },
  { id: 5, politician: 'Tommy Tuberville', party: 'R', chamber: 'Senate', state: 'AL', stock: 'AMD', ticker: 'AMD', company: 'Advanced Micro Devices', type: 'Buy', amount: '$250K - $500K', date: '2025-01-12', filedDate: '2025-01-17', return: '+22.1%' },
  { id: 6, politician: 'Mark Kelly', party: 'D', chamber: 'Senate', state: 'AZ', stock: 'BA', ticker: 'BA', company: 'Boeing Co', type: 'Sell', amount: '$50K - $100K', date: '2025-01-10', filedDate: '2025-01-15', return: '-5.3%' },
  { id: 7, politician: 'Kevin Hern', party: 'R', chamber: 'House', state: 'OK', stock: 'XOM', ticker: 'XOM', company: 'Exxon Mobil', type: 'Buy', amount: '$100K - $250K', date: '2025-01-08', filedDate: '2025-01-13', return: '+4.7%' },
  { id: 8, politician: 'Debbie Wasserman Schultz', party: 'D', chamber: 'House', state: 'FL', stock: 'GOOGL', ticker: 'GOOGL', company: 'Alphabet Inc', type: 'Buy', amount: '$15K - $50K', date: '2025-01-05', filedDate: '2025-01-10', return: '+6.2%' },
  { id: 9, politician: 'Michael McCaul', party: 'R', chamber: 'House', state: 'TX', stock: 'LMT', ticker: 'LMT', company: 'Lockheed Martin', type: 'Buy', amount: '$500K - $1M', date: '2025-01-03', filedDate: '2025-01-08', return: '+9.8%' },
  { id: 10, politician: 'Ro Khanna', party: 'D', chamber: 'House', state: 'CA', stock: 'META', ticker: 'META', company: 'Meta Platforms', type: 'Sell', amount: '$50K - $100K', date: '2025-01-02', filedDate: '2025-01-07', return: '+11.3%' },
];

export default function TradesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [partyFilter, setPartyFilter] = useState<'all' | 'D' | 'R'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Buy' | 'Sell'>('all');
  const [chamberFilter, setChamberFilter] = useState<'all' | 'House' | 'Senate'>('all');

  const filteredTrades = allTrades.filter(trade => {
    const matchesSearch = trade.politician.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesParty = partyFilter === 'all' || trade.party === partyFilter;
    const matchesType = typeFilter === 'all' || trade.type === typeFilter;
    const matchesChamber = chamberFilter === 'all' || trade.chamber === chamberFilter;
    return matchesSearch && matchesParty && matchesType && matchesChamber;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-primary-200 mb-2">
            <Link href="/congress" className="hover:text-white">Congressional Trading</Link>
            <span>/</span>
            <span>All Trades</span>
          </div>
          <h1 className="text-3xl font-bold">Recent Stock Trades</h1>
          <p className="text-primary-100 mt-2">All disclosed trades by members of Congress</p>
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
                placeholder="Search politician, ticker, or company..."
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

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'Buy' | 'Sell')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Buy & Sell</option>
              <option value="Buy">Buy Only</option>
              <option value="Sell">Sell Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-500">{filteredTrades.length} trades found</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Politician</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trade Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Filed</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Return</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTrades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mr-3 ${
                          trade.party === 'D' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {trade.party}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{trade.politician}</div>
                          <div className="text-xs text-gray-500">{trade.chamber} • {trade.state}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{trade.ticker}</div>
                      <div className="text-xs text-gray-500">{trade.company}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        trade.type === 'Buy' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.type === 'Buy' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {trade.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{trade.amount}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{trade.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{trade.filedDate}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-medium ${
                        trade.return.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {trade.return}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTrades.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">
              No trades found matching your filters.
            </div>
          )}
        </div>

        {/* Data Note */}
        <p className="mt-4 text-sm text-gray-500 text-center">
          Data from Senate and House financial disclosures. Returns calculated from trade date to current price.
          Trades must be disclosed within 45 days under the STOCK Act.
        </p>
      </div>
    </div>
  );
}
