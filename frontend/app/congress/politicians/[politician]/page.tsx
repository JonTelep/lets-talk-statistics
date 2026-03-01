'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ExternalLink, ArrowLeft, Calendar, DollarSign, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Spinner from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { LazyBarChart, LazyBar, LazyXAxis, LazyYAxis, LazyCartesianGrid, LazyTooltip, LazyPieChart, LazyPie, LazyCell } from '@/components/charts';
import { PIE_COLORS } from '@/components/charts/theme';
import { useChartTheme } from '@/hooks/useChartTheme';

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

interface Trade {
  politician: string;
  chamber: string;
  party?: string;
  state?: string;
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

interface PoliticianStats {
  name: string;
  chamber: string;
  party?: string;
  state?: string;
  total_trades: number;
  buys: number;
  sells: number;
  most_recent_trade: string;
  top_tickers: Array<{ ticker: string; name: string; trades: number; }>;
}

export default function PoliticianDetailPage() {
  const params = useParams();
  const politician = decodeURIComponent(params.politician as string);
  
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<PoliticianStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartTheme = useChartTheme();

  useEffect(() => {
    async function fetchPoliticianData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all trades for this politician
        const tradesResponse = await fetch(`${API_URL}/congress/trades?politician=${encodeURIComponent(politician)}&limit=100`);
        if (!tradesResponse.ok) throw new Error('Failed to fetch trades');
        
        const tradesData: TradesResponse = await tradesResponse.json();
        setTrades(tradesData.transactions);

        // Build stats from the trades data
        if (tradesData.transactions.length > 0) {
          const firstTrade = tradesData.transactions[0];
          const buys = tradesData.transactions.filter(t => t.type === 'Buy').length;
          const sells = tradesData.transactions.filter(t => t.type === 'Sell').length;
          
          // Count ticker frequency
          const tickerCounts: Record<string, { name: string; trades: number; }> = {};
          tradesData.transactions.forEach(trade => {
            if (trade.ticker) {
              if (!tickerCounts[trade.ticker]) {
                tickerCounts[trade.ticker] = { name: trade.asset_name || trade.ticker, trades: 0 };
              }
              tickerCounts[trade.ticker].trades++;
            }
          });
          
          const topTickers = Object.entries(tickerCounts)
            .map(([ticker, data]) => ({ ticker, ...data }))
            .sort((a, b) => b.trades - a.trades)
            .slice(0, 5);

          setStats({
            name: firstTrade.politician,
            chamber: firstTrade.chamber,
            party: firstTrade.party,
            state: firstTrade.state,
            total_trades: tradesData.transactions.length,
            buys,
            sells,
            most_recent_trade: tradesData.transactions[0]?.date || 'N/A',
            top_tickers: topTickers
          });
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load politician data');
      } finally {
        setLoading(false);
      }
    }

    if (politician) {
      fetchPoliticianData();
    }
  }, [politician]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const parts = dateStr.split('/');
    if (parts.length === 3) return `${parts[0]}/${parts[1]}/${parts[2].slice(-2)}`;
    return dateStr;
  };

  const getPartyBadge = (party?: string) => {
    switch (party) {
      case 'D': return 'bg-blue-500/20 text-blue-400';
      case 'R': return 'bg-red-500/20 text-red-400';
      case 'I': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-surface-700/20 text-surface-400';
    }
  };

  const getPartyName = (party?: string) => {
    switch (party) {
      case 'D': return 'Democrat';
      case 'R': return 'Republican';
      case 'I': return 'Independent';
      default: return party || 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-surface-500">Loading politician data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorState title="Data Unavailable" message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorState title="Politician Not Found" message={`No trading data found for "${politician}"`} />
      </div>
    );
  }

  // Prepare chart data
  const tradeTypeData = [
    { name: 'Buys', value: stats.buys, color: PIE_COLORS[0] },
    { name: 'Sells', value: stats.sells, color: PIE_COLORS[1] }
  ];

  const monthlyActivity = trades.reduce((acc, trade) => {
    const date = new Date(trade.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[monthKey] = (acc[monthKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthlyData = Object.entries(monthlyActivity)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12) // Last 12 months
    .map(([month, count]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      trades: count
    }));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-surface-600 text-sm mb-4">
            <Link href="/congress" className="hover:text-surface-300 transition-colors">Congressional Trading</Link>
            <span>/</span>
            <Link href="/congress/politicians" className="hover:text-surface-300 transition-colors">Politicians</Link>
            <span>/</span>
            <span className="text-surface-400">{stats.name}</span>
          </div>

          <div className="flex items-start gap-6">
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                {stats.name}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPartyBadge(stats.party)}`}>
                  {getPartyName(stats.party)}
                </span>
                <div className="flex items-center gap-2 text-surface-500">
                  <Building2 className="h-4 w-4" />
                  <span>{stats.chamber}</span>
                  {stats.state && <span>• {stats.state}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold font-mono mb-2" style={{ color: 'var(--text-primary)' }}>
              {stats.total_trades}
            </div>
            <div className="text-sm text-surface-500">Total Trades</div>
          </div>
          
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold font-mono text-green-400 mb-2">
              {stats.buys}
            </div>
            <div className="text-sm text-surface-500">Buys</div>
          </div>
          
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold font-mono text-red-400 mb-2">
              {stats.sells}
            </div>
            <div className="text-sm text-surface-500">Sells</div>
          </div>
          
          <div className="card p-6 text-center">
            <div className="text-lg font-mono mb-2" style={{ color: 'var(--text-primary)' }}>
              {formatDate(stats.most_recent_trade)}
            </div>
            <div className="text-sm text-surface-500">Most Recent</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Buy/Sell Distribution */}
          <div className="card p-6">
            <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
              Trade Distribution
            </h3>
            <div className="h-64">
              <LazyPieChart width={300} height={250} data={tradeTypeData}>
                <LazyPie
                  dataKey="value"
                  cx={150}
                  cy={125}
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {tradeTypeData.map((entry, index) => (
                    <LazyCell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </LazyPie>
                <LazyTooltip 
                  contentStyle={{
                    backgroundColor: chartTheme.tooltip.backgroundColor,
                    border: chartTheme.tooltip.border,
                    borderRadius: '8px',
                    color: chartTheme.tooltip.textColor,
                  }}
                />
              </LazyPieChart>
            </div>
          </div>

          {/* Monthly Activity */}
          {monthlyData.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                Monthly Activity (Last 12 Months)
              </h3>
              <div className="h-64">
                <LazyBarChart width={400} height={250} data={monthlyData}>
                  <LazyCartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid.stroke} />
                  <LazyXAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: chartTheme.axis.textColor }}
                    axisLine={{ stroke: chartTheme.axis.lineColor }}
                  />
                  <LazyYAxis 
                    tick={{ fontSize: 12, fill: chartTheme.axis.textColor }}
                    axisLine={{ stroke: chartTheme.axis.lineColor }}
                  />
                  <LazyTooltip 
                    contentStyle={{
                      backgroundColor: chartTheme.tooltip.backgroundColor,
                      border: chartTheme.tooltip.border,
                      borderRadius: '8px',
                      color: chartTheme.tooltip.textColor,
                    }}
                  />
                  <LazyBar dataKey="trades" fill={PIE_COLORS[2]} />
                </LazyBarChart>
              </div>
            </div>
          )}
        </div>

        {/* Top Stocks */}
        {stats.top_tickers.length > 0 && (
          <div className="card p-6 mb-8">
            <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
              Most Traded Stocks
            </h3>
            <div className="grid md:grid-cols-5 gap-4">
              {stats.top_tickers.map((ticker, idx) => (
                <div key={ticker.ticker} className="p-4 bg-surface-800 rounded-lg text-center">
                  <div className="text-lg font-bold font-mono text-accent mb-1">
                    {ticker.ticker}
                  </div>
                  <div className="text-xs text-surface-500 truncate mb-2" title={ticker.name}>
                    {ticker.name}
                  </div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {ticker.trades} trades
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Trades Table */}
        <div className="card">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
              All Trades ({trades.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">Trade Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">Disclosed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">Filing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {trades.map((trade, idx) => (
                  <tr key={idx} className="hover:bg-surface-800/50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                        {trade.ticker || 'N/A'}
                      </div>
                      <div className="text-xs text-surface-600 truncate max-w-48" title={trade.asset_name}>
                        {trade.asset_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        trade.type === 'Buy' ? 'bg-green-500/20 text-green-400' :
                        trade.type === 'Sell' ? 'bg-red-500/20 text-red-400' : 'bg-surface-800 text-surface-400'
                      }`}>
                        {trade.type === 'Buy' ? <TrendingUp className="h-3 w-3 mr-1" /> : trade.type === 'Sell' ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
                        {trade.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-400 font-mono">{trade.amount}</td>
                    <td className="px-6 py-4 text-sm text-surface-400">{formatDate(trade.date)}</td>
                    <td className="px-6 py-4 text-sm text-surface-500">{formatDate(trade.disclosure_date)}</td>
                    <td className="px-6 py-4">
                      {trade.filing_url && (
                        <a href={trade.filing_url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline flex items-center gap-1">
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
            <div className="p-12 text-center text-surface-500">
              No trades found for {stats.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}