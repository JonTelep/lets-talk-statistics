'use client';


import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';

import Link from 'next/link';
import { DownloadRawData } from '@/components/ui/DownloadRawData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface CongressStats {
  total_trades: number;
  total_volume: string;
  traders_count: number;
  date_range: {
    earliest: string;
    latest: string;
  };
  last_updated: string;
  by_type: Record<string, number>;
}

interface Trade {
  politician: string;
  party?: string;
  chamber: string;
  ticker: string;
  asset_name: string;
  type: string;
  amount: string;
  date: string;
  disclosure_date: string;
  filing_url: string;
}

interface Trader {
  name: string;
  trades: number;
  chamber: string;
}

interface Ticker {
  ticker: string;
  name: string;
  trades: number;
}

export default function CongressPage() {
  const [stats, setStats] = useState<CongressStats | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [topTraders, setTopTraders] = useState<Trader[]>([]);
  const [popularTickers, setPopularTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [statsRes, tradesRes, tradersRes, tickersRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/congress/stats`),
          fetch(`${API_URL}/api/v1/congress/trades/recent?limit=10`),
          fetch(`${API_URL}/api/v1/congress/traders?limit=10`),
          fetch(`${API_URL}/api/v1/congress/tickers?limit=10`)
        ]);

        if (!statsRes.ok || !tradesRes.ok || !tradersRes.ok || !tickersRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [statsData, tradesData, tradersData, tickersData] = await Promise.all([
          statsRes.json(),
          tradesRes.json(),
          tradersRes.json(),
          tickersRes.json()
        ]);

        setStats(statsData);
        setRecentTrades(tradesData);
        setTopTraders(tradersData);
        setPopularTickers(tickersData);
      } catch (err) {
        console.error('Error fetching congress data:', err);
        setError('Failed to load congressional trading data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    // Handle MM/DD/YYYY format
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[0]}/${parts[1]}/${parts[2].slice(-2)}`;
    }
    return dateStr;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading congressional trading data...</p>
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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Congressional Stock Trading</h1>
          </div>
          <p className="text-xl text-primary-100 max-w-3xl">
            Track stock trades made by members of Congress. Under the STOCK Act, 
            members must disclose trades within 45 days. Explore who's trading what.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Data Source:</strong> All data comes from official Congressional financial disclosures 
            required by the STOCK Act. Currently showing <strong>Senate</strong> data only. Trades are self-reported 
            and may have a reporting delay of up to 45 days. This is informational only — not financial advice.
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <TrendingUp className="h-4 w-4" />
              Total Trades
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.total_trades?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <DollarSign className="h-4 w-4" />
              Est. Volume
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.total_volume || '$0'}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Users className="h-4 w-4" />
              Active Traders
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.traders_count || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Calendar className="h-4 w-4" />
              Data Range
            </div>
            <p className="text-lg font-bold text-gray-900">
              {stats?.date_range?.earliest?.slice(0, 4) || '?'} - {stats?.date_range?.latest?.slice(0, 4) || '?'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Trades */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Recent Trades</h2>
                <Link href="/congress/trades" className="text-sm text-primary-600 hover:text-primary-700">
                  View all →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Politician</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentTrades.map((trade, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-2 bg-purple-100 text-purple-700">
                              S
                            </span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{trade.politician}</div>
                              <div className="text-xs text-gray-500">{trade.chamber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{trade.ticker || 'N/A'}</div>
                          <div className="text-xs text-gray-500 truncate max-w-32" title={trade.asset_name}>
                            {trade.asset_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            trade.type === 'Buy' ? 'bg-green-100 text-green-800' : 
                            trade.type === 'Sell' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {trade.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trade.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(trade.date)}</div>
                          {trade.filing_url && (
                            <a 
                              href={trade.filing_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                              Filing <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Traders */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Most Active Traders</h2>
                <Link href="/congress/politicians" className="text-sm text-primary-600 hover:text-primary-700">
                  View all →
                </Link>
              </div>
              <div className="divide-y divide-gray-200">
                {topTraders.map((person, idx) => (
                  <div key={idx} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-300 mr-3">#{idx + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{person.name}</p>
                        <p className="text-xs text-gray-500">{person.chamber}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-600">{person.trades} trades</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Tickers */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Most Traded Stocks</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {popularTickers.map((ticker, idx) => (
                  <div key={idx} className="px-6 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{ticker.ticker}</p>
                      <p className="text-xs text-gray-500 truncate max-w-40" title={ticker.name}>{ticker.name}</p>
                    </div>
                    <span className="text-xs text-gray-500">{ticker.trades} trades</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Sources Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Sources</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Senate Financial Disclosures (efdsearch.senate.gov)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                  House Financial Disclosures (coming soon)
                </li>
              </ul>
              <p className="text-xs text-gray-500 mt-4">
                Data updated from STOCK Act of 2012 required disclosures.
              </p>
            </div>

            {/* Download Raw Data */}
            <div className="mt-6">
              <DownloadRawData
                endpoints={[
                  {
                    label: 'Trading Statistics',
                    url: `${API_URL}/api/v1/congress/stats`,
                    filename: 'congress_stats.json'
                  },
                  {
                    label: 'Recent Trades',
                    url: `${API_URL}/api/v1/congress/trades/recent?limit=50`,
                    filename: 'congress_recent_trades.json'
                  },
                  {
                    label: 'All Trades',
                    url: `${API_URL}/api/v1/congress/trades?limit=200`,
                    filename: 'congress_all_trades.json'
                  },
                  {
                    label: 'Top Traders',
                    url: `${API_URL}/api/v1/congress/traders`,
                    filename: 'congress_traders.json'
                  }
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
