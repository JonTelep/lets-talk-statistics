'use client';

import { useState } from 'react';
import { ExternalLink, TrendingUp, TrendingDown, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

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

interface CongressTradesTableProps {
  trades: Trade[];
  loading: boolean;
  totalTrades?: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPoliticianClick?: (politician: string) => void;
}

type SortField = 'politician' | 'ticker' | 'type' | 'amount' | 'date' | 'disclosure_date';
type SortDirection = 'asc' | 'desc';

export default function CongressTradesTable({
  trades,
  loading,
  totalTrades,
  currentPage,
  pageSize,
  onPageChange,
  onPoliticianClick
}: CongressTradesTableProps) {
  const [sortField, setSortField] = useState<SortField>('disclosure_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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

  const getTradeIcon = (type: string) => {
    return type?.toLowerCase() === 'buy' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getTradeTypeClass = (type: string) => {
    return type?.toLowerCase() === 'buy'
      ? 'bg-green-50 text-green-800 border border-green-200'
      : 'bg-red-50 text-red-800 border border-red-200';
  };

  const formatAmount = (amount: string) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedTrades = [...trades].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'politician':
        return direction * a.politician.localeCompare(b.politician);
      case 'ticker':
        return direction * a.ticker.localeCompare(b.ticker);
      case 'type':
        return direction * a.type.localeCompare(b.type);
      case 'amount':
        // Extract numeric value for comparison
        const getAmountValue = (amount: string) => {
          if (amount.includes(' - ')) {
            const [min, max] = amount.split(' - ').map(a => parseInt(a.replace(/[$,]/g, '')));
            return (min + max) / 2;
          }
          return parseInt(amount.replace(/[$,]/g, '')) || 0;
        };
        return direction * (getAmountValue(a.amount) - getAmountValue(b.amount));
      case 'date':
        return direction * (new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'disclosure_date':
        return direction * (new Date(a.disclosure_date).getTime() - new Date(b.disclosure_date).getTime());
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil((totalTrades || trades.length) / pageSize);

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-left font-semibold text-surface-700 hover:text-surface-900 transition-colors"
    >
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-surface-200 rounded w-1/4"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4">
                <div className="h-4 bg-surface-200 rounded"></div>
                <div className="h-4 bg-surface-200 rounded"></div>
                <div className="h-4 bg-surface-200 rounded"></div>
                <div className="h-4 bg-surface-200 rounded"></div>
                <div className="h-4 bg-surface-200 rounded"></div>
                <div className="h-4 bg-surface-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-surface-200 p-12 text-center">
        <div className="text-surface-500 text-lg mb-2">No trades found</div>
        <div className="text-surface-400 text-sm">Try adjusting your filters</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-foreground">
            Congressional Trades
            {totalTrades && (
              <span className="text-surface-500 font-normal ml-2">
                ({totalTrades.toLocaleString()} total)
              </span>
            )}
          </h3>
          
          {/* Pagination Info */}
          <div className="text-sm text-surface-500">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-surface-200">
              <tr className="text-sm">
                <th className="text-left py-3 pr-4">
                  <SortableHeader field="politician">Politician</SortableHeader>
                </th>
                <th className="text-left py-3 px-4">
                  <SortableHeader field="ticker">Stock</SortableHeader>
                </th>
                <th className="text-left py-3 px-4">
                  <SortableHeader field="type">Type</SortableHeader>
                </th>
                <th className="text-left py-3 px-4">
                  <SortableHeader field="amount">Amount</SortableHeader>
                </th>
                <th className="text-left py-3 px-4">
                  <SortableHeader field="date">Trade Date</SortableHeader>
                </th>
                <th className="text-left py-3 px-4">
                  <SortableHeader field="disclosure_date">Disclosed</SortableHeader>
                </th>
                <th className="text-left py-3 pl-4">Filing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {sortedTrades.map((trade, index) => (
                <tr key={index} className="hover:bg-surface-25 transition-colors">
                  <td className="py-4 pr-4">
                    <div className="space-y-1">
                      <button
                        onClick={() => onPoliticianClick?.(trade.politician)}
                        className="font-medium text-primary-700 hover:text-primary-900 transition-colors text-left"
                      >
                        {trade.politician}
                      </button>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPartyBadge(trade.party || '')}`}>
                          {trade.party}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChamberBadge(trade.chamber)}`}>
                          {trade.chamber === 'house' ? 'House' : 'Senate'}
                        </span>
                        {trade.state && (
                          <span className="text-xs text-surface-500 font-medium">{trade.state}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-mono font-semibold text-foreground">{trade.ticker}</div>
                      <div className="text-sm text-surface-500 line-clamp-1">{trade.asset_name}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTradeTypeClass(trade.type)}`}>
                      {getTradeIcon(trade.type)}
                      {trade.type}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-foreground">{formatAmount(trade.amount)}</span>
                  </td>
                  <td className="py-4 px-4 text-sm text-surface-600">
                    {formatDate(trade.date)}
                  </td>
                  <td className="py-4 px-4 text-sm text-surface-600">
                    {formatDate(trade.disclosure_date)}
                  </td>
                  <td className="py-4 pl-4">
                    <a
                      href={trade.filing_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800 transition-colors text-sm"
                    >
                      View
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-200">
            <div className="text-sm text-surface-500">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalTrades || trades.length)} of {(totalTrades || trades.length).toLocaleString()} trades
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-surface-700 bg-white border border-surface-300 rounded-lg hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = Math.max(1, currentPage - 2) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        pageNum === currentPage
                          ? 'bg-primary-600 text-white'
                          : 'text-surface-700 bg-white border border-surface-300 hover:bg-surface-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-surface-700 bg-white border border-surface-300 rounded-lg hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}