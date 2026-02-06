'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, AlertTriangle, ExternalLink, Loader2, RefreshCw, Filter, ArrowUpDown, Building2 } from 'lucide-react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DownloadRawData } from '@/components/ui/DownloadRawData';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  Skeleton,
  StatCardSkeleton,
  TradesTableSkeleton,
  ListSkeleton
} from '@/components/ui/Skeleton';

// Colors for charts
const CHART_COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];

// Chart skeleton component
function ChartSkeleton({ height = 250 }: { height?: number }) {
  return (
    <div className="animate-pulse" style={{ height }}>
      <div className="h-full bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading chart...</div>
      </div>
    </div>
  );
}

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

interface PartyStats {
  trades: number;
  volume: number;
  volume_formatted: string;
  buys: number;
  sells: number;
}

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
  by_chamber: Record<string, number>;
  by_party: Record<string, PartyStats>;
}

interface Trade {
  politician: string;
  party?: string;
  chamber: string;
  state?: string;
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
  party: string;
  state: string;
  buys: number;
  sells: number;
  volume: number;
}

interface Ticker {
  ticker: string;
  name: string;
  trades: number;
}

type SortField = 'trades' | 'buys' | 'sells' | 'volume';

function CongressPageContent() {
  const [stats, setStats] = useState<CongressStats | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [topTraders, setTopTraders] = useState<Trader[]>([]);
  const [popularTickers, setPopularTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [partyFilter, setPartyFilter] = useState<string>('all');
  const [chamberFilter, setChamberFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('trades');
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params for filtered requests
      const traderParams = new URLSearchParams();
      traderParams.set('limit', '10');
      if (partyFilter !== 'all') traderParams.set('party', partyFilter);
      if (chamberFilter !== 'all') traderParams.set('chamber', chamberFilter);

      const [statsRes, tradesRes, tradersRes, tickersRes] = await Promise.all([
        fetch(`${API_URL}/congress/stats`),
        fetch(`${API_URL}/congress/trades/recent?limit=10`),
        fetch(`${API_URL}/congress/traders?${traderParams}`),
        fetch(`${API_URL}/congress/tickers?limit=10`)
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
  }, [partyFilter, chamberFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    // Handle MM/DD/YYYY format
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[0]}/${parts[1]}/${parts[2].slice(-2)}`;
    }
    return dateStr;
  };

  const getPartyColor = (party: string) => {
    switch (party?.toUpperCase()) {
      case 'R': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
      case 'D': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
      case 'I': return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const getChamberBadge = (chamber: string) => {
    if (chamber?.toLowerCase() === 'senate') {
      return { bg: 'bg-purple-100', text: 'text-purple-700', label: 'S' };
    }
    return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'H' };
  };

  const getTypeStyle = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'buy':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'sell':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'exchange':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Sort traders by selected field
  const sortedTraders = [...topTraders].sort((a, b) => {
    return (b[sortField] || 0) - (a[sortField] || 0);
  });

  // Show error state
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState 
          title="Data Unavailable"
          message={error}
          onRetry={fetchData}
        />
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
            required by the STOCK Act. Showing <strong>House & Senate</strong> data. Trades are self-reported 
            and may have a reporting delay of up to 45 days. This is informational only — not financial advice.
            {stats?.last_updated && (
              <span className="ml-1 text-green-700">
                Last updated: {new Date(stats.last_updated).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Party Breakdown */}
        {!loading && stats?.by_party && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Trading by Party
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Republicans */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-red-700 font-semibold flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    Republicans
                  </span>
                  <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                    {stats.by_party.R?.trades?.toLocaleString() || 0} trades
                  </span>
                </div>
                <p className="text-2xl font-bold text-red-800">{stats.by_party.R?.volume_formatted || '$0'}</p>
                <div className="mt-2 flex gap-4 text-xs text-red-600">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {stats.by_party.R?.buys?.toLocaleString() || 0} buys
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    {stats.by_party.R?.sells?.toLocaleString() || 0} sells
                  </span>
                </div>
              </div>

              {/* Democrats */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-700 font-semibold flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    Democrats
                  </span>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {stats.by_party.D?.trades?.toLocaleString() || 0} trades
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-800">{stats.by_party.D?.volume_formatted || '$0'}</p>
                <div className="mt-2 flex gap-4 text-xs text-blue-600">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {stats.by_party.D?.buys?.toLocaleString() || 0} buys
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    {stats.by_party.D?.sells?.toLocaleString() || 0} sells
                  </span>
                </div>
              </div>

              {/* Independents */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-700 font-semibold flex items-center gap-2">
                    <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                    Independents
                  </span>
                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                    {stats.by_party.I?.trades?.toLocaleString() || 0} trades
                  </span>
                </div>
                <p className="text-2xl font-bold text-purple-800">{stats.by_party.I?.volume_formatted || '$0'}</p>
                <div className="mt-2 flex gap-4 text-xs text-purple-600">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {stats.by_party.I?.buys?.toLocaleString() || 0} buys
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    {stats.by_party.I?.sells?.toLocaleString() || 0} sells
                  </span>
                </div>
              </div>
            </div>

            {/* Party comparison bar */}
            {stats.by_party.R && stats.by_party.D && (
              <div className="mt-4">
                <div className="text-xs text-gray-500 mb-1">Trade Volume Distribution</div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-red-500 transition-all duration-500"
                    style={{ width: `${(stats.by_party.R.trades / stats.total_trades) * 100}%` }}
                    title={`Republicans: ${stats.by_party.R.trades} trades`}
                  />
                  <div 
                    className="bg-blue-500 transition-all duration-500"
                    style={{ width: `${(stats.by_party.D.trades / stats.total_trades) * 100}%` }}
                    title={`Democrats: ${stats.by_party.D.trades} trades`}
                  />
                  <div 
                    className="bg-purple-500 transition-all duration-500"
                    style={{ width: `${((stats.by_party.I?.trades || 0) / stats.total_trades) * 100}%` }}
                    title={`Independents: ${stats.by_party.I?.trades || 0} trades`}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Traders Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Traders</h3>
            {loading ? (
              <ChartSkeleton height={280} />
            ) : topTraders.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={topTraders.slice(0, 8).map(t => ({
                    name: t.name.split(' ').pop() || t.name, // Last name only
                    fullName: t.name,
                    trades: t.trades,
                    chamber: t.chamber,
                  }))}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    type="number" 
                    stroke="#6b7280" 
                    fontSize={12}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#6b7280" 
                    fontSize={11}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `${value} trades`,
                      `${props.payload.fullName} (${props.payload.chamber})`
                    ]}
                  />
                  <Bar 
                    dataKey="trades" 
                    fill="#6366f1" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-gray-500">
                No trader data available
              </div>
            )}
          </div>

          {/* Trade Types Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trade Types Breakdown</h3>
            {loading ? (
              <ChartSkeleton height={280} />
            ) : stats?.by_type && Object.keys(stats.by_type).length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={Object.entries(stats.by_type).map(([name, value]) => ({
                        name,
                        value,
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {Object.keys(stats.by_type).map((_, idx) => (
                        <Cell 
                          key={`cell-${idx}`} 
                          fill={idx === 0 ? '#22c55e' : idx === 1 ? '#ef4444' : CHART_COLORS[idx % CHART_COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [value.toLocaleString(), 'Trades']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-2">
                  {Object.entries(stats.by_type).map(([name, value], idx) => (
                    <div key={name} className="flex items-center gap-2 text-sm">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: idx === 0 ? '#22c55e' : idx === 1 ? '#ef4444' : CHART_COLORS[idx % CHART_COLORS.length] }} 
                      />
                      <span className="text-gray-700">{name}: {value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-gray-500">
                No trade type data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Trades */}
          <div className="lg:col-span-2">
            {loading ? (
              <TradesTableSkeleton rows={10} />
            ) : (
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
                      {recentTrades.map((trade, idx) => {
                        const partyColor = getPartyColor(trade.party || '');
                        const chamberBadge = getChamberBadge(trade.chamber);
                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex gap-1 mr-2">
                                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${partyColor.bg} ${partyColor.text}`}>
                                    {trade.party || '?'}
                                  </span>
                                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${chamberBadge.bg} ${chamberBadge.text}`}>
                                    {chamberBadge.label}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{trade.politician}</div>
                                  <div className="text-xs text-gray-500">{trade.state ? `${trade.chamber} • ${trade.state}` : trade.chamber}</div>
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
                              <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getTypeStyle(trade.type)}`}>
                                {trade.type === 'Buy' && <TrendingUp className="h-3 w-3 mr-1" />}
                                {trade.type === 'Sell' && <TrendingDown className="h-3 w-3 mr-1" />}
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Traders
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Party</label>
                  <select 
                    value={partyFilter}
                    onChange={(e) => setPartyFilter(e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                  >
                    <option value="all">All Parties</option>
                    <option value="R">Republican</option>
                    <option value="D">Democrat</option>
                    <option value="I">Independent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chamber</label>
                  <select 
                    value={chamberFilter}
                    onChange={(e) => setChamberFilter(e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                  >
                    <option value="all">Both Chambers</option>
                    <option value="house">House</option>
                    <option value="senate">Senate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select 
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as SortField)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                  >
                    <option value="trades">Total Trades</option>
                    <option value="buys">Most Buys</option>
                    <option value="sells">Most Sells</option>
                    <option value="volume">Est. Volume</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Top Traders */}
            {loading ? (
              <ListSkeleton items={10} />
            ) : (
              <div className="bg-white rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Most Active Traders</h2>
                  <Link href="/congress/politicians" className="text-sm text-primary-600 hover:text-primary-700">
                    View all →
                  </Link>
                </div>
                <div className="divide-y divide-gray-200">
                  {sortedTraders.map((person, idx) => {
                    const partyColor = getPartyColor(person.party);
                    const chamberBadge = getChamberBadge(person.chamber);
                    return (
                      <div key={idx} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-lg font-bold text-gray-300 mr-3">#{idx + 1}</span>
                            <div className="flex gap-1 mr-2">
                              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${partyColor.bg} ${partyColor.text}`}>
                                {person.party || '?'}
                              </span>
                              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${chamberBadge.bg} ${chamberBadge.text}`}>
                                {chamberBadge.label}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{person.name}</p>
                              <p className="text-xs text-gray-500">{person.state || person.chamber}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-600">{person.trades}</span>
                            <div className="text-xs text-gray-400 flex gap-2 justify-end">
                              <span className="text-green-600">{person.buys} ↑</span>
                              <span className="text-red-600">{person.sells} ↓</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Popular Tickers */}
            {loading ? (
              <ListSkeleton items={10} />
            ) : (
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
            )}

            {/* Data Sources Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Sources</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Senate Financial Disclosures (efdsearch.senate.gov)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  House Financial Disclosures (disclosures-clerk.house.gov)
                </li>
              </ul>
              <p className="text-xs text-gray-500 mt-4">
                Data updated from STOCK Act of 2012 required disclosures.
              </p>
            </div>

            {/* Capitol Trades API Promo */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <h3 className="text-lg font-bold">Capitol Trades API</h3>
              </div>
              <p className="text-sm text-primary-100 mb-4">
                This data is powered by the Capitol Trades API — <strong className="text-white">free to use!</strong> Build your own apps with congressional stock trading data.
              </p>
              <a
                href="https://telep.io/pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-primary-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary-50 transition-colors shadow-md"
              >
                Get API Access
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {/* Download Raw Data */}
            <div className="mt-6">
              <DownloadRawData
                endpoints={[
                  {
                    label: 'Trading Statistics',
                    url: `${API_URL}/congress/stats`,
                    filename: 'congress_stats.json'
                  },
                  {
                    label: 'Recent Trades',
                    url: `${API_URL}/congress/trades/recent?limit=50`,
                    filename: 'congress_recent_trades.json'
                  },
                  {
                    label: 'All Trades',
                    url: `${API_URL}/congress/trades?limit=200`,
                    filename: 'congress_all_trades.json'
                  },
                  {
                    label: 'Top Traders',
                    url: `${API_URL}/congress/traders`,
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

export default function CongressPage() {
  return (
    <ErrorBoundary>
      <CongressPageContent />
    </ErrorBoundary>
  );
}
