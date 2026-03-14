'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, AlertTriangle, ExternalLink, Filter, Building2, FileText, CheckCircle, RefreshCw, ArrowLeft, BarChart3 } from 'lucide-react';
import { GovernmentDataStructuredData } from '@/components/seo/StructuredData';
import Link from 'next/link';
import CongressFiltersComponent, { CongressFilters } from '@/components/congress/CongressFilters';
import CongressTradesTable from '@/components/congress/CongressTradesTable';
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
import { SocialShare } from '@/components/social/SocialShare';

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

// Cache for overview data (5 minutes TTL)
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

let overviewCache: {
  stats?: CacheEntry<CongressStats>;
  traders?: CacheEntry<Trader[]>;
  tickers?: CacheEntry<Ticker[]>;
} = {};

interface PartyStats { trades: number; volume: number; volume_formatted: string; buys: number; sells: number; }
interface CongressStats { total_trades: number; total_volume: string; traders_count: number; date_range: { earliest: string; latest: string }; last_updated: string; by_type: Record<string, number>; by_chamber: Record<string, number>; by_party: Record<string, PartyStats>; }
interface Trade { politician: string; party?: string; chamber: string; state?: string; ticker: string; asset_name: string; type: string; amount: string; date: string; disclosure_date: string; filing_url: string; }
interface Trader { name: string; trades: number; chamber: string; party: string; state: string; buys: number; sells: number; volume: number; }
interface Ticker { ticker: string; name: string; trades: number; }
type SortField = 'trades' | 'buys' | 'sells' | 'volume';

// Pagination
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function CongressPageContent() {
  // State management
  const [stats, setStats] = useState<CongressStats | null>(null);
  const [filteredTrades, setFilteredTrades] = useState<PaginatedResponse<Trade> | null>(null);
  const [topTraders, setTopTraders] = useState<Trader[]>([]);
  const [topTickers, setTopTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [tradesLoading, setTradesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering & Pagination
  const [filters, setFilters] = useState<CongressFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('trades');
  const [sortAsc, setSortAsc] = useState(false);
  
  // View state
  const [selectedPolitician, setSelectedPolitician] = useState<string | null>(null);
  const [view, setView] = useState<'overview' | 'filtered' | 'politician'>('overview');
  
  const pageSize = 25;
  const chartTheme = useChartTheme();

  // Cache helper functions
  function isCacheValid(entry: CacheEntry<any> | undefined): boolean {
    return entry ? (Date.now() - entry.timestamp) < CACHE_TTL : false;
  }

  function getCachedData<T>(key: keyof typeof overviewCache): T | null {
    const entry = overviewCache[key] as CacheEntry<T> | undefined;
    return isCacheValid(entry) && entry ? entry.data : null;
  }

  function setCachedData<T>(key: keyof typeof overviewCache, data: T): void {
    (overviewCache[key] as CacheEntry<T>) = {
      data,
      timestamp: Date.now()
    };
  }

  // Fetch general stats and overview data
  const fetchOverviewData = useCallback(async (forceRefresh = false) => {
    // Check cache first
    if (!forceRefresh) {
      const cachedStats = getCachedData<CongressStats>('stats');
      const cachedTraders = getCachedData<Trader[]>('traders');
      const cachedTickers = getCachedData<Ticker[]>('tickers');

      if (cachedStats && cachedTraders && cachedTickers) {
        setStats(cachedStats);
        setTopTraders(cachedTraders);
        setTopTickers(cachedTickers);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);
    
    try {
      const [statsResponse, tradersResponse, tickersResponse] = await Promise.all([
        fetch(`${API_URL}/congress/stats`),
        fetch(`${API_URL}/congress/traders?limit=20`),
        fetch(`${API_URL}/congress/tickers?limit=15`)
      ]);

      if (!statsResponse.ok || !tradersResponse.ok || !tickersResponse.ok) {
        throw new Error('Failed to fetch overview data');
      }

      const [statsData, tradersData, tickersData] = await Promise.all([
        statsResponse.json(),
        tradersResponse.json(),
        tickersResponse.json()
      ]);

      // Cache the data
      setCachedData('stats', statsData);
      setCachedData('traders', tradersData.politicians || tradersData);
      setCachedData('tickers', tickersData.tickers || tickersData);

      setStats(statsData);
      setTopTraders(tradersData.politicians || tradersData);
      setTopTickers(tickersData.tickers || tickersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch filtered trades
  const fetchFilteredTrades = useCallback(async () => {
    setTradesLoading(true);
    
    try {
      const params = new URLSearchParams();
      params.append('limit', pageSize.toString());
      params.append('offset', ((currentPage - 1) * pageSize).toString());
      
      if (filters.politician) params.append('politician', filters.politician);
      if (filters.ticker) params.append('ticker', filters.ticker);
      if (filters.type) params.append('type', filters.type);
      if (filters.chamber) params.append('chamber', filters.chamber);
      if (filters.party) params.append('party', filters.party);
      if (filters.state) params.append('state', filters.state);
      if (filters.dateFrom) params.append('date_from', filters.dateFrom);
      if (filters.dateTo) params.append('date_to', filters.dateTo);

      const response = await fetch(`${API_URL}/congress/trades?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch filtered trades');
      }

      const data = await response.json();
      setFilteredTrades(data);
    } catch (err) {
      console.error('Error fetching filtered trades:', err);
    } finally {
      setTradesLoading(false);
    }
  }, [filters, currentPage]);

  // Effects
  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  useEffect(() => {
    if (view === 'filtered' || view === 'politician') {
      fetchFilteredTrades();
    }
  }, [view, fetchFilteredTrades]);

  // Handlers
  const handleFiltersChange = useCallback((newFilters: CongressFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setView('filtered');
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
    setSelectedPolitician(null);
    setView('overview');
  }, []);

  const handlePoliticianClick = useCallback((politician: string) => {
    setSelectedPolitician(politician);
    setFilters({ politician });
    setCurrentPage(1);
    setView('politician');
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const getPartyBadge = (party: string) => {
    switch (party?.toUpperCase()) {
      case 'R': return 'bg-red-100 text-red-800 border border-red-200';
      case 'D': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'I': return 'bg-purple-100 text-purple-800 border border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getChamberBadge = (chamber: string) => {
    switch (chamber?.toLowerCase()) {
      case 'senate': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'house': return 'bg-orange-100 text-orange-800 border border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorState title="Data Unavailable" message={error} onRetry={fetchOverviewData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-25">
      <GovernmentDataStructuredData
        title="Congressional Stock Trading Disclosures"
        description="Real-time congressional stock trading data from STOCK Act disclosures filed by senators and representatives"
        url="https://letstalkstatistics.com/congress"
        dataSource="US House and Senate Ethics Committees"
        lastUpdated={stats?.last_updated}
      />
      
      <div className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-mono text-surface-600 mb-4 uppercase tracking-wider">STOCK Act Disclosures</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-4">
              Congressional Stock Trades
            </h1>
            <p className="text-lg text-surface-500 max-w-3xl mb-6 leading-relaxed">
              Live tracking of stock trading disclosures from members of Congress under the STOCK Act.
              Data sourced directly from House and Senate ethics disclosures.
            </p>
            
            {/* Capitol Trades API Callout */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-1">
                      Powered by Capitol Trades API
                    </h3>
                    <p className="text-blue-700 text-sm">
                      This data is available via our free congressional trading API. Perfect for developers and researchers.
                    </p>
                  </div>
                </div>
                <Link
                  href="/pricing"
                  className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                >
                  Get API Access
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Social Share */}
            <div className="mb-8">
              <SocialShare 
                title={`Congressional Trading Data - ${congressData?.total_trades ? `${congressData.total_trades.toLocaleString()} trades tracked` : 'Stock disclosure tracker'}`}
                description={`Track congressional stock trades in real-time. ${congressData?.unique_politicians || 'Members of Congress'} politicians, ${congressData?.unique_tickers || 'thousands'} of tickers, all from official STOCK Act disclosures.`}
                hashtags={['CongressTrades', 'StockAct', 'transparency', 'politics']}
                via="letstalkstats"
                compact={false}
              />
            </div>
          </div>

          {/* Navigation */}
          {view !== 'overview' && (
            <div className="mb-6">
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Overview
              </button>
              
              {view === 'politician' && selectedPolitician && (
                <h2 className="text-2xl font-semibold text-foreground mt-2">
                  Trades by {selectedPolitician}
                </h2>
              )}
            </div>
          )}

          {/* Stats Cards - Show on overview or when loading */}
          {(view === 'overview' || loading) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {loading ? (
                [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
              ) : stats ? (
                <>
                  <div className="bg-white rounded-xl p-6 border border-surface-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-surface-500 text-sm font-medium">Total Trades</span>
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {stats.total_trades.toLocaleString()}
                    </div>
                    <div className="text-xs text-surface-500">
                      Since {new Date(stats.date_range.earliest).getFullYear()}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-surface-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-surface-500 text-sm font-medium">Total Volume</span>
                      <DollarSign className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {stats.total_volume}
                    </div>
                    <div className="text-xs text-surface-500">
                      Estimated value
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-surface-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-surface-500 text-sm font-medium">Active Traders</span>
                      <Users className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {stats.traders_count}
                    </div>
                    <div className="text-xs text-surface-500">
                      Members of Congress
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-surface-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-surface-500 text-sm font-medium">Last Updated</span>
                      <Calendar className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {new Date(stats.last_updated).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="text-xs text-surface-500">
                      {new Date(stats.last_updated).toLocaleDateString('en-US', { 
                        year: 'numeric' 
                      })}
                    </div>
                    <button
                      onClick={() => fetchOverviewData(true)}
                      className="mt-2 flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 transition-colors"
                      disabled={loading}
                    >
                      <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* Filters */}
          <CongressFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClear={handleClearFilters}
          />

          {/* Main Content */}
          {view === 'overview' ? (
            /* Overview Content - Top Traders and Top Tickers */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Traders */}
              <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
                <div className="p-6 border-b border-surface-200">
                  <h3 className="text-xl font-semibold text-foreground">Most Active Traders</h3>
                  <p className="text-surface-500 text-sm mt-1">Ranked by number of trades</p>
                </div>
                <div className="p-6">
                  {loading ? (
                    <ListSkeleton />
                  ) : (
                    <div className="space-y-4">
                      {topTraders.slice(0, 10).map((trader, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-surface-25 rounded-lg hover:bg-surface-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-semibold text-surface-500 w-6">
                              #{index + 1}
                            </span>
                            <div>
                              <button
                                onClick={() => handlePoliticianClick(trader.name)}
                                className="font-semibold text-primary-700 hover:text-primary-900 transition-colors text-left"
                              >
                                {trader.name}
                              </button>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPartyBadge(trader.party)}`}>
                                  {trader.party}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChamberBadge(trader.chamber)}`}>
                                  {trader.chamber === 'house' ? 'House' : 'Senate'}
                                </span>
                                <span className="text-xs text-surface-500">{trader.state}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-foreground">{trader.trades} trades</div>
                            <div className="text-sm text-surface-500">
                              {trader.buys}B / {trader.sells}S
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Top Tickers */}
              <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
                <div className="p-6 border-b border-surface-200">
                  <h3 className="text-xl font-semibold text-foreground">Most Traded Stocks</h3>
                  <p className="text-surface-500 text-sm mt-1">Popular among Congress members</p>
                </div>
                <div className="p-6">
                  {loading ? (
                    <ListSkeleton />
                  ) : (
                    <div className="space-y-4">
                      {topTickers.map((ticker, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-surface-25 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-semibold text-surface-500 w-6">
                              #{index + 1}
                            </span>
                            <div>
                              <div className="font-mono font-semibold text-foreground">{ticker.ticker}</div>
                              <div className="text-sm text-surface-500 line-clamp-1">{ticker.name}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-foreground">{ticker.trades} trades</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Filtered Results */
            <CongressTradesTable
              trades={filteredTrades?.data || []}
              loading={tradesLoading}
              totalTrades={filteredTrades?.total}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPoliticianClick={handlePoliticianClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}