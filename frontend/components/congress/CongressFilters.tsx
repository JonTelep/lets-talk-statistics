'use client';

import { useState } from 'react';
import { Filter, X, Calendar, Building, Users, DollarSign } from 'lucide-react';

export interface CongressFilters {
  politician?: string;
  ticker?: string;
  type?: 'Buy' | 'Sell' | '';
  chamber?: 'house' | 'senate' | '';
  party?: 'R' | 'D' | 'I' | '';
  dateFrom?: string;
  dateTo?: string;
}

interface CongressFiltersProps {
  filters: CongressFilters;
  onFiltersChange: (filters: CongressFilters) => void;
  onClear: () => void;
}

export default function CongressFiltersComponent({ filters, onFiltersChange, onClear }: CongressFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof CongressFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== '');

  return (
    <div className="bg-surface-50 border border-surface-200 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-surface-600" />
          <h3 className="text-lg font-semibold text-foreground">Filter Trades</h3>
          {hasActiveFilters && (
            <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-medium">
              {Object.values(filters).filter(v => v && v !== '').length} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 text-sm text-surface-600 hover:text-surface-800 transition-colors"
            >
              <X className="h-4 w-4" />
              Clear all
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-2 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors text-sm font-medium"
          >
            {isExpanded ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Politician Search */}
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-sm font-medium text-surface-700">
              <Users className="h-4 w-4" />
              Politician
            </label>
            <input
              type="text"
              placeholder="Search by name..."
              value={filters.politician || ''}
              onChange={(e) => updateFilter('politician', e.target.value)}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>

          {/* Ticker Search */}
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-sm font-medium text-surface-700">
              <DollarSign className="h-4 w-4" />
              Stock Ticker
            </label>
            <input
              type="text"
              placeholder="e.g. AAPL, TSLA"
              value={filters.ticker || ''}
              onChange={(e) => updateFilter('ticker', e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>

          {/* Transaction Type */}
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-sm font-medium text-surface-700">
              <Building className="h-4 w-4" />
              Transaction Type
            </label>
            <select
              value={filters.type || ''}
              onChange={(e) => updateFilter('type', e.target.value)}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              <option value="">All Types</option>
              <option value="Buy">Buy</option>
              <option value="Sell">Sell</option>
            </select>
          </div>

          {/* Chamber */}
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-sm font-medium text-surface-700">
              <Building className="h-4 w-4" />
              Chamber
            </label>
            <select
              value={filters.chamber || ''}
              onChange={(e) => updateFilter('chamber', e.target.value)}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              <option value="">Both Chambers</option>
              <option value="house">House</option>
              <option value="senate">Senate</option>
            </select>
          </div>

          {/* Party */}
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-sm font-medium text-surface-700">
              <Users className="h-4 w-4" />
              Party
            </label>
            <select
              value={filters.party || ''}
              onChange={(e) => updateFilter('party', e.target.value)}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              <option value="">All Parties</option>
              <option value="R">Republican</option>
              <option value="D">Democratic</option>
              <option value="I">Independent</option>
            </select>
          </div>

          {/* Date From */}
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-sm font-medium text-surface-700">
              <Calendar className="h-4 w-4" />
              From Date
            </label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>

          {/* Date To */}
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-sm font-medium text-surface-700">
              <Calendar className="h-4 w-4" />
              To Date
            </label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-surface-200">
          <div className="flex flex-wrap gap-2">
            {filters.politician && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                Politician: {filters.politician}
              </span>
            )}
            {filters.ticker && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                Ticker: {filters.ticker}
              </span>
            )}
            {filters.type && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                Type: {filters.type}
              </span>
            )}
            {filters.chamber && (
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                Chamber: {filters.chamber.charAt(0).toUpperCase() + filters.chamber.slice(1)}
              </span>
            )}
            {filters.party && (
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                Party: {filters.party === 'R' ? 'Republican' : filters.party === 'D' ? 'Democratic' : 'Independent'}
              </span>
            )}
            {(filters.dateFrom || filters.dateTo) && (
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                Date: {filters.dateFrom || 'Beginning'} - {filters.dateTo || 'Present'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}