'use client';

import { Building2, TrendingUp, DollarSign, Users, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import {
  LazyLineChart, LazyLine, LazyXAxis, LazyYAxis, LazyCartesianGrid, LazyTooltip,
  LazyPieChart, LazyPie, LazyCell,
} from '@/components/charts';
import { chartTooltipStyle, chartAxisStyle, chartGridStyle, PIE_COLORS } from '@/components/charts/theme';
import { useDebtHistory, calculateDebtStats, DebtDataPoint } from '@/services/hooks/useDebtData';
import { DownloadRawData } from '@/components/ui/DownloadRawData';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorStateCompact, ErrorStateTableRow } from '@/components/ui/ErrorState';
import { Skeleton, StatCardSkeleton, HeroCounterSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

const debtHolders = [
  { holder: 'Federal Reserve', amount: 5.02, percent: 13.9 },
  { holder: 'Foreign Governments', amount: 7.94, percent: 21.9 },
  { holder: 'Mutual Funds', amount: 3.28, percent: 9.1 },
  { holder: 'State & Local Govts', amount: 1.45, percent: 4.0 },
  { holder: 'Private Pensions', amount: 0.97, percent: 2.7 },
  { holder: 'Other', amount: 17.56, percent: 48.4 },
];

const topForeignHolders = [
  { country: 'Japan', amount: 1.08 },
  { country: 'China', amount: 0.77 },
  { country: 'United Kingdom', amount: 0.72 },
  { country: 'Luxembourg', amount: 0.39 },
  { country: 'Canada', amount: 0.35 },
  { country: 'Belgium', amount: 0.33 },
];

const milestones = [
  { amount: '$1T', year: '1982', days: '—' },
  { amount: '$5T', year: '1996', days: '5,110' },
  { amount: '$10T', year: '2008', days: '4,380' },
  { amount: '$20T', year: '2017', days: '3,285' },
  { amount: '$30T', year: '2022', days: '1,825' },
  { amount: '$35T', year: '2024', days: '730' },
];

function TableRowSkeleton() {
  return (
    <tr>
      <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
      <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
      <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-14 ml-auto" /></td>
      <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
    </tr>
  );
}

function aggregateByYear(data: DebtDataPoint[]): Array<{ year: string; debt: number; gdpRatio: number }> {
  const yearlyData: Map<string, { total: number; count: number }> = new Map();
  data.forEach((point) => {
    const year = point.date.substring(0, 4);
    const existing = yearlyData.get(year) || { total: 0, count: 0 };
    existing.total += point.total_debt;
    existing.count += 1;
    yearlyData.set(year, existing);
  });
  return Array.from(yearlyData.entries())
    .map(([year, { total, count }]) => {
      const avgDebt = total / count;
      const gdpEstimate = 28_000_000_000_000 * (1 + (parseInt(year) - 2024) * 0.025);
      return { year, debt: avgDebt / 1_000_000_000_000, gdpRatio: (avgDebt / gdpEstimate) * 100 };
    })
    .sort((a, b) => parseInt(b.year) - parseInt(a.year))
    .slice(0, 10);
}

function DebtPageContent() {
  const { data: debtData, loading, error, refetch } = useDebtHistory(1095);
  const stats = debtData ? calculateDebtStats(debtData.data) : null;
  const historicalDebt = debtData ? aggregateByYear(debtData.data) : [];
  const interestDaily = stats ? (parseFloat(stats.totalDebtTrillions) * 0.03 / 365).toFixed(1) : '3.0';

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-mono text-surface-600 mb-4 uppercase tracking-wider">Federal Debt Analysis</p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-white mb-4">National Debt</h1>
          <p className="text-lg text-surface-500 max-w-2xl">
            Real-time tracking of U.S. federal debt from Treasury Department data. 
            Analysis of debt holders, growth patterns, and GDP ratios.
          </p>
        </div>
      </div>

      {/* Live Counter */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        {loading ? (
          <HeroCounterSkeleton />
        ) : error ? (
          <div className="card p-8 text-center">
            <ErrorStateCompact message="Failed to load live data" onRetry={refetch} />
          </div>
        ) : stats ? (
          <div className="card p-8">
            <div className="text-center mb-6">
              <p className="text-xs font-mono text-surface-600 uppercase tracking-wider mb-2">Current Federal Debt</p>
            </div>
            <div className="text-center mb-8">
              <p className="data-value text-5xl md:text-6xl text-red-400 mb-2">${stats.totalDebtTrillions}T</p>
              <p className="data-label">As of {stats.lastUpdated}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-surface-800 rounded-lg border border-border">
                <div className="data-value text-2xl text-red-400">+${stats.dailyIncreaseBillions}B</div>
                <div className="data-label mt-1">Daily Increase (Avg)</div>
              </div>
              <div className="text-center p-4 bg-surface-800 rounded-lg border border-border">
                <div className="data-value text-2xl text-amber-400">${interestDaily}B</div>
                <div className="data-label mt-1">Daily Interest (Est.)</div>
              </div>
            </div>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 text-xs font-mono text-surface-600">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                Live Treasury Fiscal Data API
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-surface-900 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-surface-500">
            <strong className="text-surface-300">Source:</strong> U.S. Treasury — Bureau of the Fiscal Service. 
            Includes debt held by public and intragovernmental holdings.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>
          ) : (
            <>
              <div className="card p-6">
                <div className="flex items-center gap-2 text-surface-500 text-sm mb-1"><Users className="h-4 w-4" />Per Citizen</div>
                <p className="text-2xl font-semibold text-red-400">${stats?.debtPerCitizen.toLocaleString() || '—'}</p>
                <p className="text-xs text-surface-600">Every man, woman, child</p>
              </div>
              <div className="card p-6">
                <div className="flex items-center gap-2 text-surface-500 text-sm mb-1"><DollarSign className="h-4 w-4" />Per Taxpayer</div>
                <p className="text-2xl font-semibold text-red-400">${stats?.debtPerTaxpayer.toLocaleString() || '—'}</p>
                <p className="text-xs text-surface-600">Per tax-filing household</p>
              </div>
              <div className="card p-6">
                <div className="flex items-center gap-2 text-surface-500 text-sm mb-1"><TrendingUp className="h-4 w-4" />Debt-to-GDP</div>
                <p className="text-2xl font-semibold text-white">{stats?.gdpRatio || '—'}%</p>
                <p className="text-xs text-surface-600">Exceeds annual GDP</p>
              </div>
              <div className="card p-6">
                <div className="flex items-center gap-2 text-surface-500 text-sm mb-1"><Clock className="h-4 w-4" />Interest (FY24)</div>
                <p className="text-2xl font-semibold text-red-400">$1.13T</p>
                <p className="text-xs text-surface-600">Just to service the debt</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="card p-6">
          <h2 className="text-lg font-medium text-white mb-4">Debt Growth Over Time</h2>
          {loading ? (
            <ChartSkeleton height={350} />
          ) : error ? (
            <ErrorStateCompact message="Failed to load chart data" onRetry={refetch} />
          ) : historicalDebt.length > 0 ? (
            <LazyLineChart data={[...historicalDebt].reverse()} height={350} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <LazyCartesianGrid {...chartGridStyle} />
              <LazyXAxis dataKey="year" {...chartAxisStyle} />
              <LazyYAxis {...chartAxisStyle} tickFormatter={(v) => `$${v}T`} />
              <LazyTooltip contentStyle={chartTooltipStyle} formatter={(v: any) => [`$${v.toFixed(2)}T`, 'Total Debt']} />
              <LazyLine type="monotone" dataKey="debt" stroke="#f87171" strokeWidth={2} dot={{ fill: '#f87171', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: '#ef4444' }} />
            </LazyLineChart>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-surface-600">No data available</div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Historical Table */}
            <div className="card">
              <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                <h2 className="text-base font-medium text-white">Historical National Debt</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">Year</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase">Total Debt</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase">Debt/GDP</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase">Growth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? (
                      Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} />)
                    ) : error ? (
                      <ErrorStateTableRow colSpan={4} message="Failed to load data" onRetry={refetch} />
                    ) : historicalDebt.length > 0 ? (
                      historicalDebt.map((row, idx) => {
                        const prevDebt = historicalDebt[idx + 1]?.debt || row.debt;
                        const growth = ((row.debt - prevDebt) / prevDebt * 100).toFixed(1);
                        return (
                          <tr key={idx} className="hover:bg-surface-800/50">
                            <td className="px-6 py-4 text-sm font-medium text-white">{row.year}</td>
                            <td className="px-6 py-4 text-sm text-right font-mono text-red-400">${row.debt.toFixed(2)}T</td>
                            <td className="px-6 py-4 text-sm text-right text-surface-500">{row.gdpRatio.toFixed(1)}%</td>
                            <td className="px-6 py-4 text-sm text-right">
                              {idx < historicalDebt.length - 1 && parseFloat(growth) !== 0 && (
                                <span className={parseFloat(growth) > 0 ? 'text-red-400' : 'text-green-400'}>
                                  {parseFloat(growth) > 0 ? '+' : ''}{growth}%
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-surface-600">No data available</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Milestones */}
            <div className="mt-8 card">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-base font-medium text-white">Debt Milestones</h2>
                <p className="text-sm text-surface-600">Days between each trillion-dollar milestone</p>
              </div>
              <div className="p-6">
                {milestones.map((m, idx) => (
                  <div key={idx} className="flex items-center mb-3 last:mb-0">
                    <div className="w-20 text-right pr-4">
                      <p className="text-sm font-mono font-medium text-white">{m.amount}</p>
                      <p className="text-xs text-surface-600">{m.year}</p>
                    </div>
                    <div className="w-2 h-2 bg-red-400 rounded-full" />
                    <div className="ml-4 text-sm text-surface-500">
                      {m.days !== '—' && <span>+{m.days} days</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="card">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-base font-medium text-white">Who Holds Our Debt?</h2>
              </div>
              <div className="p-6">
                <LazyPieChart height={250}>
                  <LazyPie data={debtHolders.map(h => ({ name: h.holder, value: h.amount }))} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                    {debtHolders.map((_, idx) => <LazyCell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                  </LazyPie>
                  <LazyTooltip contentStyle={chartTooltipStyle} formatter={(v: any) => [`$${v}T`, 'Amount']} />
                </LazyPieChart>
                <div className="mt-4 space-y-2">
                  {debtHolders.map((h, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                        <span className="text-surface-400">{h.holder}</span>
                      </div>
                      <span className="font-mono text-surface-300">${h.amount}T</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 card">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-base font-medium text-white">Top Foreign Holders</h2>
              </div>
              <div className="divide-y divide-border">
                {topForeignHolders.map((c, idx) => (
                  <div key={idx} className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm text-surface-600 w-6">#{idx + 1}</span>
                      <span className="text-sm text-surface-300">{c.country}</span>
                    </div>
                    <span className="text-sm font-mono text-surface-400">${c.amount}T</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 card p-6">
              <h3 className="text-base font-medium text-white mb-3">Data Sources</h3>
              <ul className="text-sm text-surface-500 space-y-2">
                <li>• <a href="https://fiscaldata.treasury.gov/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Treasury Fiscal Data API</a></li>
                <li>• TreasuryDirect.gov</li>
                <li>• Bureau of the Fiscal Service</li>
              </ul>
            </div>

            <div className="mt-6">
              <DownloadRawData endpoints={[
                { label: 'Debt History (3 years)', url: `${API_URL}/debt/?days=1095`, filename: 'debt_history.json' },
                { label: 'Latest Debt Figure', url: `${API_URL}/debt/latest`, filename: 'debt_latest.json' },
              ]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DebtPage() {
  return <ErrorBoundary><DebtPageContent /></ErrorBoundary>;
}
