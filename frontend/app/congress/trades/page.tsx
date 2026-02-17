'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Search, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Spinner from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

interface Trade { politician: string; chamber: string; ticker: string; asset_name: string; type: string; amount: string; date: string; disclosure_date: string; filing_url: string; }
interface TradesResponse { total: number; limit: number; offset: number; transactions: Trade[]; }

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
        setLoading(true); setError(null);
        const params = new URLSearchParams({ limit: limit.toString(), offset: (page * limit).toString() });
        if (searchTerm) {
          if (searchTerm.length <= 5 && searchTerm.toUpperCase() === searchTerm) params.set('ticker', searchTerm);
          else params.set('politician', searchTerm);
        }
        if (typeFilter !== 'all') params.set('type', typeFilter);
        const response = await fetch(`${API_URL}/congress/trades?${params}`);
        if (!response.ok) throw new Error('Failed to fetch trades');
        const data: TradesResponse = await response.json();
        setTrades(data.transactions); setTotal(data.total);
      } catch (err) { setError('Failed to load trades.'); }
      finally { setLoading(false); }
    }
    fetchTrades();
  }, [searchTerm, typeFilter, page]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const parts = dateStr.split('/');
    if (parts.length === 3) return `${parts[0]}/${parts[1]}/${parts[2].slice(-2)}`;
    return dateStr;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-surface-600 text-sm mb-4">
            <Link href="/congress" className="hover:text-surface-300 transition-colors">Congressional Trading</Link>
            <span>/</span>
            <span className="text-surface-400">All Trades</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Stock Trades</h1>
          <p className="text-lg text-surface-500">All disclosed trades by members of Congress</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
        <div className="card p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-surface-600" />
              <input
                type="text"
                placeholder="Search politician name or ticker (e.g., NVDA)..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                className="w-full pl-10 pr-4 py-2 bg-surface-800 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value as 'all' | 'Buy' | 'Sell'); setPage(0); }}
              className="px-4 py-2 bg-surface-800 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent text-surface-300"
            >
              <option value="all">Buy &amp; Sell</option>
              <option value="Buy">Buy Only</option>
              <option value="Sell">Sell Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="card p-12 text-center">
            <Spinner size="lg" className="mx-auto mb-4" />
            <p className="text-surface-500">Loading trades...</p>
          </div>
        ) : error ? (
          <div className="card p-12"><ErrorState message={error} onRetry={() => window.location.reload()} /></div>
        ) : (
          <div className="card">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <p className="text-sm text-surface-500">{total.toLocaleString()} trades found</p>
              {totalPages > 1 && <p className="text-sm text-surface-500">Page {page + 1} of {totalPages}</p>}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">Politician</th>
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
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 mr-3">S</span>
                          <div>
                            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{trade.politician}</div>
                            <div className="text-xs text-surface-600">{trade.chamber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{trade.ticker || 'N/A'}</div>
                        <div className="text-xs text-surface-600 truncate max-w-40" title={trade.asset_name}>{trade.asset_name}</div>
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

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-border">
              {trades.map((trade, idx) => (
                <div key={idx} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400">S</span>
                      <div>
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{trade.politician}</div>
                        <div className="text-xs text-surface-600">{trade.chamber}</div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      trade.type === 'Buy' ? 'bg-green-500/20 text-green-400' :
                      trade.type === 'Sell' ? 'bg-red-500/20 text-red-400' : 'bg-surface-800 text-surface-400'
                    }`}>{trade.type}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm border-t border-border pt-3">
                    <div><span className="text-surface-600">Stock:</span><div className="font-mono" style={{ color: 'var(--text-primary)' }}>{trade.ticker || 'N/A'}</div></div>
                    <div><span className="text-surface-600">Amount:</span><div className="font-mono" style={{ color: 'var(--text-primary)' }}>{trade.amount}</div></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm border-t border-border pt-3">
                    <div><span className="text-surface-600">Trade:</span><div style={{ color: 'var(--text-primary)' }}>{formatDate(trade.date)}</div></div>
                    <div><span className="text-surface-600">Disclosed:</span><div style={{ color: 'var(--text-primary)' }}>{formatDate(trade.disclosure_date)}</div></div>
                  </div>
                  {trade.filing_url && (
                    <a href={trade.filing_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-accent hover:underline font-medium">
                      View Filing <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>

            {trades.length === 0 && <div className="px-6 py-12 text-center text-surface-600">No trades found matching your filters.</div>}

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border flex justify-between items-center">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary text-sm">Previous</button>
                <span className="text-sm text-surface-500">Showing {page * limit + 1} – {Math.min((page + 1) * limit, total)} of {total}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1} className="btn-secondary text-sm">Next</button>
              </div>
            )}
          </div>
        )}

        <p className="mt-4 text-sm text-surface-600 text-center">
          Data from Senate financial disclosures. Trades must be disclosed within 45 days under the STOCK Act.
        </p>
      </div>
    </div>
  );
}
