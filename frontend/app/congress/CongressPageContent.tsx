'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, AlertTriangle, ExternalLink, Filter, Building2, FileText, CheckCircle, RefreshCw } from 'lucide-react';
import { GovernmentDataStructuredData } from '@/components/seo/StructuredData';
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

export default function CongressPageContent() {
  const [stats, setStats] = useState<CongressStats | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [topTraders, setTopTraders] = useState<Trader[]>([]);
  const [topTickers, setTopTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('trades');
  const [sortAsc, setSortAsc] = useState(false);
  const chartTheme = useChartTheme();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [statsResponse, tradesResponse, tradersResponse, tickersResponse] = await Promise.all([
        fetch(`${API_URL}/congress/stats`),
        fetch(`${API_URL}/congress/trades/recent?limit=15`),
        fetch(`${API_URL}/congress/politicians?sort_by=${sortField}&ascending=${sortAsc}&limit=20`),
        fetch(`${API_URL}/congress/tickers?limit=15`)
      ]);

      if (!statsResponse.ok || !tradesResponse.ok || !tradersResponse.ok || !tickersResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [statsData, tradesData, tradersData, tickersData] = await Promise.all([
        statsResponse.json(),
        tradesResponse.json(),
        tradersResponse.json(),
        tickersResponse.json()
      ]);

      setStats(statsData);
      setRecentTrades(tradesData.trades || []);
      setTopTraders(tradersData.politicians || []);
      setTopTickers(tickersData.tickers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [sortField, sortAsc]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getPartyBadge = (party: string) => {
    switch (party?.toUpperCase()) {
      case 'R': return 'bg-red-600 text-white';
      case 'D': return 'bg-blue-600 text-white';
      case 'I': return 'bg-purple-600 text-white';
      default: return 'bg-surface-700 text-surface-300';
    }
  };

  const getChamberBadge = (chamber: string) => {
    switch (chamber?.toLowerCase()) {
      case 'senate': return 'bg-emerald-600 text-white';
      case 'house': return 'bg-orange-600 text-white';
      default: return 'bg-surface-700 text-surface-300';
    }
  };

  const formatAmount = (amount: string) => {
    // Parse amount ranges like "$1,001 - $15,000"
    if (amount.includes(' - ')) {
      const [min, max] = amount.split(' - ').map(a => a.replace(/[$,]/g, ''));
      const minNum = parseInt(min);
      const maxNum = parseInt(max);
      const avg = (minNum + maxNum) / 2;
      
      if (avg >= 1000000) return `$${(avg / 1000000).toFixed(1)}M`;
      if (avg >= 1000) return `$${(avg / 1000).toFixed(0)}K`;
      return `$${avg.toFixed(0)}`;
    }
    return amount;
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorState title="Data Unavailable" message={error} onRetry={fetchData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <GovernmentDataStructuredData
        title="Congressional Stock Trading Disclosures"
        description="Real-time congressional stock trading data from STOCK Act disclosures filed by senators and representatives"
        url="https://letstalkstatistics.com/congress"
        dataSource="US House and Senate Ethics Committees"
        lastUpdated={stats?.last_updated}
      />
      
      {/* Rest of the component content - I'll add this next */}
      <div className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-mono text-surface-600 mb-4 uppercase tracking-wider">STOCK Act Disclosures</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-4">
            Congressional Stock Trades
          </h1>
          <p className="text-lg text-surface-500 max-w-3xl mb-8 leading-relaxed">
            Live tracking of stock trading disclosures from members of Congress under the STOCK Act.
            Data sourced directly from House and Senate ethics disclosures.
          </p>
          
          {/* Stats cards and other content would go here */}
          {loading && <div>Loading...</div>}
          {!loading && stats && <div>Data loaded successfully!</div>}
        </div>
      </div>
    </div>
  );
}