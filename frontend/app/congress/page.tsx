'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, AlertTriangle, ExternalLink, Filter, Building2, FileText, CheckCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import {
  LazyBarChart, LazyBar, LazyXAxis, LazyYAxis, LazyCartesianGrid, LazyTooltip,
  LazyPieChart, LazyPie, LazyCell,
} from '@/components/charts';
import { PIE_COLORS } from '@/components/charts/theme';
import { useChartTheme } from '@/hooks/useChartTheme';
import { DownloadRawData } from '@/components/ui/DownloadRawData';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton, StatCardSkeleton, TradesTableSkeleton, ListSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

interface PartyStats { trades: number; volume: number; volume_formatted: string; buys: number; sells: number; }
interface CongressStats { total_trades: number; total_volume: string; traders_count: number; date_range: { earliest: string; latest: string }; last_updated: string; by_type: Record<string, number>; by_chamber: Record<string, number>; by_party: Record<string, PartyStats>; }
interface Trade { politician: string; party?: string; chamber: string; state?: string; ticker: string; asset_name: string; type: string; amount: string; date: string; disclosure_date: string; filing_url: string; }
interface Trader { name: string; trades: number; chamber: string; party: string; state: string; buys: number; sells: number; volume: number; }
interface Ticker { ticker: string; name: string; trades: number; }
type SortField = 'trades' | 'buys' | 'sells' | 'volume';

function CongressPageContent() {
  const [stats, setStats] = useState<CongressStats | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [topTraders, setTopTraders] = useState<Trader[]>([]);
  const [popularTickers, setPopularTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partyFilter, setPartyFilter] = useState<string>('all');
  const [chamberFilter, setChamberFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('trades');
  const { tooltipStyle, axisStyle, gridStyle } = useChartTheme();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const traderParams = new URLSearchParams();
      traderParams.set('limit', '10');
      if (partyFilter !== 'all') traderParams.set('party', partyFilter);
      if (chamberFilter !== 'all') traderParams.set('chamber', chamberFilter);
      const [statsRes, tradesRes, tradersRes, tickersRes] = await Promise.all([
        fetch(`${API_URL}/congress/stats`), fetch(`${API_URL}/congress/trades/recent?limit=10`),
        fetch(`${API_URL}/congress/traders?${traderParams}`), fetch(`${API_URL}/congress/tickers?limit=10`),
      ]);
      if (!statsRes.ok || !tradesRes.ok || !tradersRes.ok || !tickersRes.ok) throw new Error('Failed to fetch data');
      const [statsData, tradesData, tradersData, tickersData] = await Promise.all([statsRes.json(), tradesRes.json(), tradersRes.json(), tickersRes.json()]);
      setStats(statsData); setRecentTrades(tradesData); setTopTraders(tradersData); setPopularTickers(tickersData);
    } catch (err) { setError('Failed to load congressional trading data. Please try again later.'); }
    finally { setLoading(false); }
  }, [partyFilter, chamberFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const parts = dateStr.split('/');
    if (parts.length === 3) return `${parts[0]}/${parts[1]}/${parts[2].slice(-2)}`;
    return dateStr;
  };

  const getPartyBadge = (party: string) => {
    switch (party?.toUpperCase()) {
      case 'R': return 'bg-red-500/20 text-red-400';
      case 'D': return 'bg-blue-500/20 text-blue-400';
      case 'I': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-surface-800 text-surface-400';
    }
  };

  const getChamberBadge = (chamber: string) => {
    return chamber?.toLowerCase() === 'senate'
      ? 'bg-purple-500/20 text-purple-400'
      : 'bg-emerald-500/20 text-emerald-400';
  };

  const getTypeStyle = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'buy': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'sell': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'exchange': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      default: return 'bg-surface-800 text-surface-400 border border-border';
    }
  };

  const sortedTraders = [...topTraders].sort((a, b) => (b[sortField] || 0) - (a[sortField] || 0));

  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorState title="Data Unavailable" message={error} onRetry={fetchData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-mono text-surface-600 mb-4 uppercase tracking-wider">STOCK Act Disclosures</p>
          <h1 className="text-4xl sm:text-5xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Congressional Stock Trading</h1>
          <p className="text-lg text-surface-500 max-w-3xl">
            Track stock trades made by members of Congress. Under the STOCK Act,
            members must disclose trades within 45 days.
          </p>
        </div>
      </div>

      {/* Disclaimers */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-4">
        <div className="bg-surface-900 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-surface-500">
            <strong className="text-surface-300">Data Source:</strong> Official Congressional financial disclosures (STOCK Act).
            House &amp; Senate. Trades are self-reported with up to 45-day delay. Not financial advice.
            {stats?.last_updated && <span className="ml-1 text-green-400"> Updated: {new Date(stats.last_updated).toLocaleString()}</span>}
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-surface-900 border border-green-500/20 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-surface-500">
            <strong className="text-surface-300">100% Verifiable:</strong> Every trade links to the original disclosure document.
            Click <FileText className="h-3.5 w-3.5 inline mx-1 text-surface-400" /> to view actual filings.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>
          ) : (
            <>
              <div className="card p-6">
                <div className="flex items-center gap-2 text-surface-500 text-sm mb-1"><TrendingUp className="h-4 w-4" />Total Trades</div>
                <p className="text-2xl font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{stats?.total_trades?.toLocaleString() || 0}</p>
              </div>
              <div className="card p-6">
                <div className="flex items-center gap-2 text-surface-500 text-sm mb-1"><DollarSign className="h-4 w-4" />Est. Volume</div>
                <p className="text-2xl font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{stats?.total_volume || '$0'}</p>
              </div>
              <div className="card p-6">
                <div className="flex items-center gap-2 text-surface-500 text-sm mb-1"><Users className="h-4 w-4" />Active Traders</div>
                <p className="text-2xl font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{stats?.traders_count || 0}</p>
              </div>
              <div className="card p-6">
                <div className="flex items-center gap-2 text-surface-500 text-sm mb-1"><Calendar className="h-4 w-4" />Data Range</div>
                <p className="text-lg font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>
                  {stats?.date_range?.earliest?.slice(0, 4) || '?'} – {stats?.date_range?.latest?.slice(0, 4) || '?'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Party Breakdown */}
        {!loading && stats?.by_party && (
          <div className="mt-8 card p-6">
            <h2 className="text-base font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Building2 className="h-5 w-5 text-surface-500" />Trading by Party
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { key: 'R', label: 'Republicans', color: 'border-red-500/30', dotColor: 'bg-red-400', textColor: 'text-red-400' },
                { key: 'D', label: 'Democrats', color: 'border-blue-500/30', dotColor: 'bg-blue-400', textColor: 'text-blue-400' },
                { key: 'I', label: 'Independents', color: 'border-purple-500/30', dotColor: 'bg-purple-400', textColor: 'text-purple-400' },
              ].map(({ key, label, color, dotColor, textColor }) => (
                <div key={key} className={`bg-surface-800 rounded-lg p-4 border ${color}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`${textColor} font-semibold flex items-center gap-2 text-sm`}>
                      <span className={`w-2.5 h-2.5 ${dotColor} rounded-full`}></span>{label}
                    </span>
                    <span className="text-xs text-surface-600 font-mono">{stats.by_party[key]?.trades?.toLocaleString() || 0} trades</span>
                  </div>
                  <p className={`text-xl font-bold font-mono ${textColor}`}>{stats.by_party[key]?.volume_formatted || '$0'}</p>
                  <div className="mt-2 flex gap-4 text-xs text-surface-500">
                    <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-green-400" />{stats.by_party[key]?.buys?.toLocaleString() || 0} buys</span>
                    <span className="flex items-center gap-1"><TrendingDown className="h-3 w-3 text-red-400" />{stats.by_party[key]?.sells?.toLocaleString() || 0} sells</span>
                  </div>
                </div>
              ))}
            </div>
            {stats.by_party.R && stats.by_party.D && (
              <div className="mt-4">
                <div className="text-xs text-surface-600 mb-1">Trade Volume Distribution</div>
                <div className="h-3 bg-surface-800 rounded-full overflow-hidden flex">
                  <div className="bg-red-400 transition-all duration-500" style={{ width: `${(stats.by_party.R.trades / stats.total_trades) * 100}%` }} />
                  <div className="bg-blue-400 transition-all duration-500" style={{ width: `${(stats.by_party.D.trades / stats.total_trades) * 100}%` }} />
                  <div className="bg-purple-400 transition-all duration-500" style={{ width: `${((stats.by_party.I?.trades || 0) / stats.total_trades) * 100}%` }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-base font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Most Active Traders</h3>
            {loading ? <ChartSkeleton height={280} /> : topTraders.length > 0 ? (
              <LazyBarChart data={topTraders.slice(0, 8).map(t => ({ name: t.name.split(' ').pop() || t.name, fullName: t.name, trades: t.trades, chamber: t.chamber }))} height={280} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <LazyCartesianGrid {...gridStyle} />
                <LazyXAxis type="number" {...axisStyle} />
                <LazyYAxis dataKey="name" type="category" {...axisStyle} width={70} />
                <LazyTooltip contentStyle={tooltipStyle} formatter={(value: any, name: any, props: any) => [`${Number(value)} trades`, `${props?.payload?.fullName || name} (${props?.payload?.chamber || ''})`]} />
                <LazyBar dataKey="trades" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </LazyBarChart>
            ) : <div className="h-[280px] flex items-center justify-center text-surface-600">No trader data</div>}
          </div>

          <div className="card p-6">
            <h3 className="text-base font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Trade Types Breakdown</h3>
            {loading ? <ChartSkeleton height={280} /> : stats?.by_type && Object.keys(stats.by_type).length > 0 ? (
              <>
                <LazyPieChart height={220}>
                  <LazyPie data={Object.entries(stats.by_type).map(([name, value]) => ({ name, value }))} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                    {Object.keys(stats.by_type).map((_, idx) => <LazyCell key={idx} fill={idx === 0 ? '#10b981' : idx === 1 ? '#ef4444' : PIE_COLORS[idx % PIE_COLORS.length]} />)}
                  </LazyPie>
                  <LazyTooltip contentStyle={tooltipStyle} formatter={(value: any) => [String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ","), 'Trades']} />
                </LazyPieChart>
                <div className="flex flex-wrap justify-center gap-4 mt-2">
                  {Object.entries(stats.by_type).map(([name, value], idx) => (
                    <div key={name} className="flex items-center gap-2 text-sm">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: idx === 0 ? '#10b981' : idx === 1 ? '#ef4444' : PIE_COLORS[idx % PIE_COLORS.length] }} />
                      <span className="text-surface-400">{name}: <span className="font-mono">{value.toLocaleString()}</span></span>
                    </div>
                  ))}
                </div>
              </>
            ) : <div className="h-[280px] flex items-center justify-center text-surface-600">No data</div>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Trades */}
          <div className="lg:col-span-2">
            {loading ? <TradesTableSkeleton rows={10} /> : (
              <div className="card">
                <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                  <h2 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>Recent Trades</h2>
                  <Link href="/congress/trades" className="text-sm text-accent hover:underline">View all →</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">Politician</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recentTrades.map((trade, idx) => (
                        <tr key={idx} className="hover:bg-surface-800/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex gap-1 mr-2">
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${getPartyBadge(trade.party || '')}`}>{trade.party || '?'}</span>
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${getChamberBadge(trade.chamber)}`}>{trade.chamber?.toLowerCase() === 'senate' ? 'S' : 'H'}</span>
                              </div>
                              <div>
                                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{trade.politician}</div>
                                <div className="text-xs text-surface-600">{trade.state ? `${trade.chamber} • ${trade.state}` : trade.chamber}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{trade.ticker || 'N/A'}</div>
                            <div className="text-xs text-surface-600 truncate max-w-32" title={trade.asset_name}>{trade.asset_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${getTypeStyle(trade.type)}`}>
                              {trade.type === 'Buy' && <TrendingUp className="h-3 w-3 mr-1" />}
                              {trade.type === 'Sell' && <TrendingDown className="h-3 w-3 mr-1" />}
                              {trade.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-400 font-mono">{trade.amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{formatDate(trade.date)}</div>
                            <div className="text-xs text-surface-600">Filed: {formatDate(trade.disclosure_date)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {trade.filing_url ? (
                              <a href={trade.filing_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-colors text-xs font-medium" title="View original disclosure">
                                <FileText className="h-3.5 w-3.5" />Filing<ExternalLink className="h-3 w-3" />
                              </a>
                            ) : <span className="text-xs text-surface-600">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Filters */}
            <div className="card p-6">
              <h3 className="text-base font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Filter className="h-4 w-4 text-surface-500" />Filter Traders
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Party', value: partyFilter, onChange: setPartyFilter, options: [['all', 'All Parties'], ['R', 'Republican'], ['D', 'Democrat'], ['I', 'Independent']] },
                  { label: 'Chamber', value: chamberFilter, onChange: setChamberFilter, options: [['all', 'Both Chambers'], ['house', 'House'], ['senate', 'Senate']] },
                  { label: 'Sort By', value: sortField, onChange: (v: string) => setSortField(v as SortField), options: [['trades', 'Total Trades'], ['buys', 'Most Buys'], ['sells', 'Most Sells'], ['volume', 'Est. Volume']] },
                ].map(({ label, value, onChange, options }) => (
                  <div key={label}>
                    <label className="block text-sm font-medium text-surface-500 mb-1">{label}</label>
                    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md bg-surface-800 border-border text-surface-300 text-sm focus:border-accent focus:ring-accent py-2 px-3">
                      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Traders */}
            {loading ? <ListSkeleton items={10} /> : (
              <div className="card">
                <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                  <h2 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>Most Active Traders</h2>
                  <Link href="/congress/politicians" className="text-sm text-accent hover:underline">View all →</Link>
                </div>
                <div className="divide-y divide-border">
                  {sortedTraders.map((person, idx) => (
                    <div key={idx} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-sm font-mono text-surface-600 mr-3 w-5">#{idx + 1}</span>
                          <div className="flex gap-1 mr-2">
                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${getPartyBadge(person.party)}`}>{person.party || '?'}</span>
                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${getChamberBadge(person.chamber)}`}>{person.chamber?.toLowerCase() === 'senate' ? 'S' : 'H'}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{person.name}</p>
                            <p className="text-xs text-surface-600">{person.state || person.chamber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold font-mono text-surface-400">{person.trades}</span>
                          <div className="text-xs flex gap-2 justify-end">
                            <span className="text-green-400">{person.buys}↑</span>
                            <span className="text-red-400">{person.sells}↓</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Tickers */}
            {loading ? <ListSkeleton items={10} /> : (
              <div className="card">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>Most Traded Stocks</h2>
                </div>
                <div className="divide-y divide-border">
                  {popularTickers.map((ticker, idx) => (
                    <div key={idx} className="px-6 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{ticker.ticker}</p>
                        <p className="text-xs text-surface-600 truncate max-w-40" title={ticker.name}>{ticker.name}</p>
                      </div>
                      <span className="text-xs text-surface-500 font-mono">{ticker.trades} trades</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sources */}
            <div className="card p-6">
              <h3 className="text-base font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <CheckCircle className="h-4 w-4 text-green-400" />Verified Sources
              </h3>
              <ul className="text-sm text-surface-500 space-y-3">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></span>
                  <div>
                    <a href="https://efdsearch.senate.gov" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">Senate Financial Disclosures</a>
                    <p className="text-xs text-surface-600">efdsearch.senate.gov</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></span>
                  <div>
                    <a href="https://disclosures-clerk.house.gov" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">House Financial Disclosures</a>
                    <p className="text-xs text-surface-600">disclosures-clerk.house.gov</p>
                  </div>
                </li>
              </ul>
            </div>

            <DownloadRawData endpoints={[
              { label: 'Trading Statistics', url: `${API_URL}/congress/stats`, filename: 'congress_stats.json' },
              { label: 'Recent Trades', url: `${API_URL}/congress/trades/recent?limit=50`, filename: 'congress_recent_trades.json' },
              { label: 'All Trades', url: `${API_URL}/congress/trades?limit=200`, filename: 'congress_all_trades.json' },
              { label: 'Top Traders', url: `${API_URL}/congress/traders`, filename: 'congress_traders.json' },
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CongressPage() {
  return <ErrorBoundary><CongressPageContent /></ErrorBoundary>;
}
