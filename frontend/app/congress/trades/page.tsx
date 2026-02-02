'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Search, Filter, Calendar, DollarSign, Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface Trade {
  politician: string;
  chamber: string;
  ticker: string;
  asset_name: string;
  type: string;
  amount: string;
  date: string;
  disclosure_date: string;
  filing_url: string;
}

interface TradesResponse {
  total: number;
  limit: number;
  offset: number;
  transactions: Trade[];
}

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Buy' | 'Sell'>('all');
  const [page, setPage] = useState(0);
  const limit = 50;

  useEffect(() => {
    async function fetchTrades() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          limit: limit.toString(),
          offset: (page * limit).toString(),
        });

        if (searchTerm) {
          // Search by politician or ticker
          if (searchTerm.length <= 5 && searchTerm.toUpperCase() === searchTerm) {
            params.set('ticker', searchTerm);
          } else {
            params.set('politician', searchTerm);
          }
        }

        if (typeFilter !== 'all') {
          params.set('type', typeFilter);
        }

        const response = await fetch(`${API_URL}/congress/trades?${params}`);
        if (!response.ok) throw new Error('Failed to fetch trades');

        const data: TradesResponse = await response.json();
        setTrades(data.transactions);
        setTotal(data.total);
      } catch (err) {
        console.error('Error fetching trades:', err);
        setError('Failed to load trades. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchTrades();
  }, [searchTerm, typeFilter, page]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[0]}/${parts[1]}/${parts[2].slice(-2)}`;
    }
    return dateStr;
  };

  const totalPages = Math.ceil(total / limit);

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
          <h1 className="text-3xl font-bold">Stock Trades</h1>
          <p className="text-primary-100 mt-2">All disclosed trades by members of Congress (Senate)</p>
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
                placeholder="Search politician name or ticker (e.g., NVDA)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as 'all' | 'Buy' | 'Sell');
                setPage(0);
              }}
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
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading trades...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-4" />
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <p className="text-sm text-gray-500">{total.toLocaleString()} trades found</p>
              {totalPages > 1 && (
                <p className="text-sm text-gray-500">
                  Page {page + 1} of {totalPages}
                </p>
              )}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disclosed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Filing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {trades.map((trade, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mr-3 bg-purple-100 text-purple-700">
                            S
                          </span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{trade.politician}</div>
                            <div className="text-xs text-gray-500">{trade.chamber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{trade.ticker || 'N/A'}</div>
                        <div className="text-xs text-gray-500 truncate max-w-40" title={trade.asset_name}>
                          {trade.asset_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          trade.type === 'Buy' 
                            ? 'bg-green-100 text-green-800' 
                            : trade.type === 'Sell'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {trade.type === 'Buy' ? <TrendingUp className="h-3 w-3 mr-1" /> : 
                           trade.type === 'Sell' ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
                          {trade.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{trade.amount}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(trade.date)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(trade.disclosure_date)}</td>
                      <td className="px-6 py-4">
                        {trade.filing_url && (
                          <a 
                            href={trade.filing_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {trades.length === 0 && (
              <div className="px-6 py-12 text-center text-gray-500">
                No trades found matching your filters.
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Showing {page * limit + 1} - {Math.min((page + 1) * limit, total)} of {total}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Data Note */}
        <p className="mt-4 text-sm text-gray-500 text-center">
          Data from Senate financial disclosures. House data coming soon.
          Trades must be disclosed within 45 days under the STOCK Act.
        </p>
      </div>
    </div>
  );
}
