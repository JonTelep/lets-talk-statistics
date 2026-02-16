'use client';

import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Calendar, Building2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import {
  LazyBarChart, LazyBar, LazyXAxis, LazyYAxis, LazyCartesianGrid, LazyTooltip,
  LazyPieChart, LazyPie, LazyCell,
} from '@/components/charts';
import { chartTooltipStyle, chartAxisStyle, chartGridStyle, PIE_COLORS } from '@/components/charts/theme';
import { useBudgetSummary, formatBudgetNumber } from '@/services/hooks/useBudgetData';
import { DownloadRawData } from '@/components/ui/DownloadRawData';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton, StatCardSkeleton, TableSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

const spendingCategories = [
  { category: 'Mandatory (Entitlements)', amount: 4.09, percent: 66.7 },
  { category: 'Discretionary', amount: 1.81, percent: 29.5 },
  { category: 'Net Interest', amount: 0.66, percent: 10.8 },
];

const revenueCategories = [
  { category: 'Individual Income Tax', amount: 2.18, percent: 49.1 },
  { category: 'Payroll Tax', amount: 1.48, percent: 33.3 },
  { category: 'Corporate Income Tax', amount: 0.42, percent: 9.5 },
  { category: 'Excise & Other', amount: 0.36, percent: 8.1 },
];

const historicalDeficit = [
  { year: 'FY 2024', deficit: 1.69 },
  { year: 'FY 2023', deficit: 1.70 },
  { year: 'FY 2022', deficit: 1.38 },
  { year: 'FY 2021', deficit: 2.77 },
  { year: 'FY 2020', deficit: 3.13 },
  { year: 'FY 2019', deficit: 0.98 },
];

function BudgetPageContent() {
  const { data: budgetData, loading, error, refetch } = useBudgetSummary();
  const totalSpending = budgetData ? budgetData.totalOutlays / 1_000_000 : null;
  const totalRevenue = budgetData ? budgetData.totalReceipts / 1_000_000 : null;
  const deficit = budgetData ? budgetData.deficit / 1_000_000 : null;
  const fiscalYear = budgetData?.fiscalYear;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-mono text-surface-600 mb-4 uppercase tracking-wider">Government Spending</p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-white mb-4">Federal Budget</h1>
          <p className="text-lg text-surface-500 max-w-2xl">
            Track how the U.S. government spends taxpayer money. All data from official Treasury and OMB reports.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-surface-900 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-surface-500">
            <strong className="text-surface-300">Source:</strong> U.S. Treasury Monthly Statement via Fiscal Data API.
            {budgetData && <span className="ml-1 text-green-400"> Fetched: {new Date(budgetData.fetchedAt).toLocaleString()}</span>}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-medium text-white">
            {fiscalYear ? `FY ${fiscalYear}` : 'Federal Budget'} Overview
          </h2>
          {loading && <RefreshCw className="h-4 w-4 animate-spin text-surface-500" />}
        </div>

        {error ? (
          <ErrorState message="Failed to load budget data" onRetry={refetch} className="mb-8" />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {loading ? (
              <><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>
            ) : (
              <>
                <div className="card p-6">
                  <div className="flex items-center gap-2 text-surface-500 text-sm mb-1"><TrendingDown className="h-4 w-4 text-red-400" />Total Spending</div>
                  <p className="text-2xl font-semibold text-red-400">{totalSpending !== null ? `$${totalSpending.toFixed(2)}T` : '—'}</p>
                  <p className="text-xs text-surface-600">Federal outlays</p>
                </div>
                <div className="card p-6">
                  <div className="flex items-center gap-2 text-surface-500 text-sm mb-1"><TrendingUp className="h-4 w-4 text-green-400" />Total Revenue</div>
                  <p className="text-2xl font-semibold text-green-400">{totalRevenue !== null ? `$${totalRevenue.toFixed(2)}T` : '—'}</p>
                  <p className="text-xs text-surface-600">Federal receipts</p>
                </div>
                <div className="card p-6">
                  <div className="flex items-center gap-2 text-surface-500 text-sm mb-1"><AlertTriangle className="h-4 w-4 text-amber-400" />Budget Deficit</div>
                  <p className="text-2xl font-semibold text-amber-400">{deficit !== null ? `$${Math.abs(deficit).toFixed(2)}T` : '—'}</p>
                  <p className="text-xs text-surface-600">Spending − Revenue</p>
                </div>
                <div className="card p-6">
                  <div className="flex items-center gap-2 text-surface-500 text-sm mb-1"><Calendar className="h-4 w-4 text-blue-400" />Data Status</div>
                  {budgetData ? (
                    <><p className="text-2xl font-semibold text-white">FY {fiscalYear}</p><p className="text-xs text-green-400">✓ Live from Treasury</p></>
                  ) : <p className="text-2xl font-semibold text-surface-600">—</p>}
                </div>
              </>
            )}
          </div>
        )}

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="text-base font-medium text-white mb-4">Historical Budget Deficit</h3>
            <LazyBarChart data={[...historicalDeficit].reverse()} height={280} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <LazyCartesianGrid {...chartGridStyle} />
              <LazyXAxis dataKey="year" {...chartAxisStyle} tickFormatter={(v) => v.replace('FY ', "'")} />
              <LazyYAxis {...chartAxisStyle} tickFormatter={(v) => `$${v}T`} />
              <LazyTooltip contentStyle={chartTooltipStyle} formatter={(v: any) => [`$${Number(v).toFixed(2)}T`, 'Deficit']} />
              <LazyBar dataKey="deficit" fill="#f87171" radius={[4, 4, 0, 0]} />
            </LazyBarChart>
          </div>

          <div className="card p-6">
            <h3 className="text-base font-medium text-white mb-4">Federal Spending Breakdown</h3>
            <LazyPieChart height={280}>
              <LazyPie data={spendingCategories.map(c => ({ name: c.category.split(' ')[0], fullName: c.category, value: c.amount }))} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {spendingCategories.map((_, idx) => <LazyCell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
              </LazyPie>
              <LazyTooltip contentStyle={chartTooltipStyle} formatter={(v: any, n: any, p: any) => [`$${Number(v)}T`, p?.payload?.fullName || n]} />
            </LazyPieChart>
          </div>
        </div>

        {/* Classification from API */}
        {loading ? (
          <div className="card mb-8"><div className="px-6 py-4 border-b border-border"><Skeleton className="h-5 w-56" /></div><TableSkeleton rows={5} columns={3} /></div>
        ) : budgetData?.byClassification && budgetData.byClassification.length > 0 && (
          <div className="card p-6 mb-8">
            <h3 className="text-base font-medium text-white mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-surface-500" />Spending by Classification (Live)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase">Classification</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-surface-500 uppercase">Outlays</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-surface-500 uppercase">Receipts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {budgetData.byClassification.map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-800/50">
                      <td className="px-4 py-3 text-sm text-white">{item.classification}</td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-red-400">{formatBudgetNumber(item.outlays)}</td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-green-400">{formatBudgetNumber(item.receipts)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Spending Categories */}
            <div className="card">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-base font-medium text-white">Spending by Category</h2>
              </div>
              <div className="p-6 space-y-4">
                {spendingCategories.map((cat, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-surface-300">{cat.category}</span>
                      <span className="font-mono text-surface-500">${cat.amount}T ({cat.percent}%)</span>
                    </div>
                    <div className="w-full bg-surface-800 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${cat.percent}%`, backgroundColor: PIE_COLORS[idx] }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Historical Deficit Table */}
            <div className="mt-8 card">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-base font-medium text-white">Historical Deficit</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">Fiscal Year</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase">Deficit</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase">Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {historicalDeficit.map((row, idx) => {
                      const prev = historicalDeficit[idx + 1]?.deficit;
                      const change = prev ? ((row.deficit - prev) / prev * 100).toFixed(1) : null;
                      return (
                        <tr key={idx} className="hover:bg-surface-800/50">
                          <td className="px-6 py-4 text-sm text-white">{row.year}</td>
                          <td className="px-6 py-4 text-sm text-right font-mono text-red-400">${row.deficit.toFixed(2)}T</td>
                          <td className="px-6 py-4 text-sm text-right">
                            {change && <span className={parseFloat(change) < 0 ? 'text-green-400' : 'text-red-400'}>{parseFloat(change) > 0 ? '+' : ''}{change}%</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div>
            <div className="card">
              <div className="px-6 py-4 border-b border-border"><h2 className="text-base font-medium text-white">Revenue Sources</h2></div>
              <div className="p-6 space-y-4">
                {revenueCategories.map((cat, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm text-surface-400">{cat.category}</span>
                    <div className="text-right">
                      <span className="text-sm font-mono text-green-400">${cat.amount}T</span>
                      <span className="text-xs text-surface-600 ml-2">({cat.percent}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 card p-6">
              <h3 className="text-base font-medium text-white mb-3">Data Sources</h3>
              <ul className="text-sm text-surface-500 space-y-2">
                <li>• <a href="https://fiscaldata.treasury.gov/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Treasury Fiscal Data API</a></li>
                <li>• USASpending.gov</li>
                <li>• Office of Management and Budget</li>
              </ul>
            </div>

            <div className="mt-6">
              <DownloadRawData endpoints={[{ label: 'Budget Summary', url: `${API_URL}/budget/`, filename: 'budget_summary.json' }]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BudgetPage() {
  return <ErrorBoundary><BudgetPageContent /></ErrorBoundary>;
}
