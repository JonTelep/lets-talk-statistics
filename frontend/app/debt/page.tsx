'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, Clock, AlertTriangle } from 'lucide-react';
import {
  useDebtHistory, calculateDebtStats, DebtDataPoint,
  useDebtHolders, useDebtHoldersHistory, useDebtInterest,
  useDebtRates, useForeignHolders, useDebtGdpRatio,
} from '@/services/hooks/useDebtData';
import { DownloadRawData } from '@/components/ui/DownloadRawData';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorStateCompact, ErrorStateTableRow } from '@/components/ui/ErrorState';
import { Skeleton, StatCardSkeleton, HeroCounterSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';
import { useChartTheme } from '@/hooks/useChartTheme';

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

const PIE_COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
const LINE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const milestones = [
  { amount: '$1T', year: '1982', days: '—' },
  { amount: '$5T', year: '1996', days: '5,110' },
  { amount: '$10T', year: '2008', days: '4,380' },
  { amount: '$20T', year: '2017', days: '3,285' },
  { amount: '$30T', year: '2022', days: '1,825' },
  { amount: '$35T', year: '2024', days: '730' },
];

// Recharts loaded via single dynamic import (avoids nested Suspense issues)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let RC: Record<string, any> | null = null;
let rcPromise: Promise<void> | null = null;

function useRecharts() {
  const [loaded, setLoaded] = useState(!!RC);
  useEffect(() => {
    if (RC) return;
    if (!rcPromise) {
      rcPromise = import('recharts').then((mod) => {
        RC = {
          ResponsiveContainer: mod.ResponsiveContainer,
          LineChart: mod.LineChart,
          Line: mod.Line,
          BarChart: mod.BarChart,
          Bar: mod.Bar,
          PieChart: mod.PieChart,
          Pie: mod.Pie,
          Cell: mod.Cell,
          XAxis: mod.XAxis,
          YAxis: mod.YAxis,
          CartesianGrid: mod.CartesianGrid,
          Tooltip: mod.Tooltip,
          Legend: mod.Legend,
        };
      });
    }
    rcPromise.then(() => setLoaded(true));
  }, []);
  return loaded ? RC : null;
}

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

function aggregateByYear(data: DebtDataPoint[]): Array<{ year: string; debt: number }> {
  const yearlyData: Map<string, { total: number; count: number }> = new Map();
  data.forEach((point) => {
    const year = point.date.substring(0, 4);
    const existing = yearlyData.get(year) || { total: 0, count: 0 };
    existing.total += point.total_debt;
    existing.count += 1;
    yearlyData.set(year, existing);
  });
  return Array.from(yearlyData.entries())
    .map(([year, { total, count }]) => ({
      year,
      debt: total / count / 1_000_000_000_000,
    }))
    .sort((a, b) => parseInt(b.year) - parseInt(a.year))
    .slice(0, 10);
}

function DebtPageContent() {
  const { data: debtData, loading, error, refetch } = useDebtHistory(1095);
  const stats = debtData ? calculateDebtStats(debtData.data) : null;
  const historicalDebt = debtData ? aggregateByYear(debtData.data) : [];

  // Deep dive hooks
  const { data: holdersData, loading: holdersLoading } = useDebtHolders();
  const { data: holdersHistory, loading: historyLoading } = useDebtHoldersHistory();
  const { data: interestData, loading: interestLoading } = useDebtInterest();
  const { data: ratesData, loading: ratesLoading } = useDebtRates();
  const { data: foreignData, loading: foreignLoading } = useForeignHolders();
  const { data: gdpData, loading: gdpLoading } = useDebtGdpRatio();

  const { tooltipStyle, axisStyle, gridStyle } = useChartTheme();
  const rc = useRecharts();

  // Compute daily interest from real data
  const currentFyInterest = interestData?.annual?.find(
    (a) => a.fiscal_year === interestData.current_fy
  );
  const dailyInterest = currentFyInterest
    ? (currentFyInterest.total / 365 / 1_000_000_000).toFixed(1)
    : stats
      ? (parseFloat(stats.totalDebtTrillions) * 0.03 / 365).toFixed(1)
      : '—';

  // Latest annual interest for stats card
  const latestAnnualInterest = interestData?.annual?.length
    ? interestData.annual[interestData.annual.length - 1]
    : null;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-mono text-surface-600 mb-4 uppercase tracking-wider">Federal Debt Analysis</p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-foreground mb-4">National Debt</h1>
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
                <div className="data-value text-2xl text-amber-400">${dailyInterest}B</div>
                <div className="data-label mt-1">Daily Interest{interestData ? '' : ' (Est.)'}</div>
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
            <strong className="text-surface-300">Source:</strong> U.S. Treasury — Bureau of the Fiscal Service,
            FRED (Federal Reserve Economic Data), Treasury International Capital (TIC) System.
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
                <p className="text-2xl font-semibold text-foreground">
                  {gdpData?.latest?.percent != null ? `${gdpData.latest.percent}%` : `${stats?.gdpRatio || '—'}%`}
                </p>
                <p className="text-xs text-surface-600">
                  {gdpData?.latest?.percent != null ? 'FRED data' : 'Estimated'}
                </p>
              </div>
              <div className="card p-6">
                <div className="flex items-center gap-2 text-surface-500 text-sm mb-1"><Clock className="h-4 w-4" />Annual Interest</div>
                <p className="text-2xl font-semibold text-red-400">
                  {latestAnnualInterest
                    ? `$${(latestAnnualInterest.total / 1_000_000_000_000).toFixed(2)}T`
                    : '$1.13T'}
                </p>
                <p className="text-xs text-surface-600">
                  {latestAnnualInterest ? `FY${latestAnnualInterest.fiscal_year}` : 'FY24'} — to service the debt
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Debt Growth Chart */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="card p-6">
          <h2 className="text-lg font-medium text-foreground mb-4">Debt Growth Over Time</h2>
          {loading || !rc ? (
            <ChartSkeleton height={350} />
          ) : error ? (
            <ErrorStateCompact message="Failed to load chart data" onRetry={refetch} />
          ) : historicalDebt.length > 0 ? (
            <rc.ResponsiveContainer width="100%" height={350}>
              <rc.LineChart data={[...historicalDebt].reverse()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <rc.CartesianGrid {...gridStyle} />
                <rc.XAxis dataKey="year" {...axisStyle} />
                <rc.YAxis {...axisStyle} tickFormatter={(v: number) => `$${v}T`} />
                <rc.Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${v.toFixed(2)}T`, 'Total Debt']} />
                <rc.Line type="monotone" dataKey="debt" stroke="#f87171" strokeWidth={2} dot={{ fill: '#f87171', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: '#ef4444' }} />
              </rc.LineChart>
            </rc.ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-surface-600">No data available</div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Historical Table */}
            <div className="card">
              <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                <h2 className="text-base font-medium text-foreground">Historical National Debt</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">Year</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase">Total Debt</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase">Growth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? (
                      Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} />)
                    ) : error ? (
                      <ErrorStateTableRow colSpan={3} message="Failed to load data" onRetry={refetch} />
                    ) : historicalDebt.length > 0 ? (
                      historicalDebt.map((row, idx) => {
                        const prevDebt = historicalDebt[idx + 1]?.debt || row.debt;
                        const growth = ((row.debt - prevDebt) / prevDebt * 100).toFixed(1);
                        return (
                          <tr key={idx} className="hover:bg-surface-800/50">
                            <td className="px-6 py-4 text-sm font-medium text-foreground">{row.year}</td>
                            <td className="px-6 py-4 text-sm text-right font-mono text-red-400">${row.debt.toFixed(2)}T</td>
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
                      <tr><td colSpan={3} className="px-6 py-8 text-center text-surface-600">No data available</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Milestones */}
            <div className="mt-8 card">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-base font-medium text-foreground">Debt Milestones</h2>
                <p className="text-sm text-surface-600">Days between each trillion-dollar milestone</p>
              </div>
              <div className="p-6">
                {milestones.map((m, idx) => (
                  <div key={idx} className="flex items-center mb-3 last:mb-0">
                    <div className="w-20 text-right pr-4">
                      <p className="text-sm font-mono font-medium text-foreground">{m.amount}</p>
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
                <h2 className="text-base font-medium text-foreground">Who Holds Our Debt?</h2>
              </div>
              <div className="p-6">
                {holdersLoading || !rc ? (
                  <ChartSkeleton height={250} />
                ) : holdersData?.holders ? (
                  <>
                    <rc.ResponsiveContainer width="100%" height={250}>
                      <rc.PieChart>
                        <rc.Pie
                          data={holdersData.holders.map(h => ({ name: h.name, value: h.amount_billions }))}
                          cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value"
                        >
                          {holdersData.holders.map((_, idx) => (
                            <rc.Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                          ))}
                        </rc.Pie>
                        <rc.Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${v.toFixed(0)}B`, 'Amount']} />
                      </rc.PieChart>
                    </rc.ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {holdersData.holders.map((h, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                            <span className="text-surface-400">{h.name}</span>
                          </div>
                          <span className="font-mono text-surface-300">
                            ${h.amount_billions >= 1000 ? `${(h.amount_billions / 1000).toFixed(2)}T` : `${h.amount_billions.toFixed(0)}B`}
                          </span>
                        </div>
                      ))}
                    </div>
                    {holdersData.as_of_date && (
                      <p className="text-xs text-surface-600 mt-3">As of {holdersData.as_of_date}</p>
                    )}
                  </>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-surface-600">No data available</div>
                )}
              </div>
            </div>

            <div className="mt-6 card">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-base font-medium text-foreground">Top Foreign Holders</h2>
              </div>
              <div className="divide-y divide-border">
                {foreignLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="px-6 py-3 flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))
                ) : foreignData?.countries?.length ? (
                  foreignData.countries.slice(0, 10).map((c, idx) => (
                    <div key={idx} className="px-6 py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm text-surface-600 w-6">#{idx + 1}</span>
                        <span className="text-sm text-surface-300">{c.country}</span>
                      </div>
                      <span className="text-sm font-mono text-surface-400">
                        ${c.holdings_billions >= 1000 ? `${(c.holdings_billions / 1000).toFixed(2)}T` : `${c.holdings_billions}B`}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center text-surface-600">No data available</div>
                )}
              </div>
            </div>

            <div className="mt-6 card p-6">
              <h3 className="text-base font-medium text-foreground mb-3">Data Sources</h3>
              <ul className="text-sm text-surface-500 space-y-2">
                <li>• <a href="https://fiscaldata.treasury.gov/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Treasury Fiscal Data API</a></li>
                <li>• <a href="https://fred.stlouisfed.org/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">FRED (Federal Reserve Economic Data)</a></li>
                <li>• <a href="https://ticdata.treasury.gov/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Treasury International Capital (TIC)</a></li>
              </ul>
            </div>

            <div className="mt-6">
              <DownloadRawData endpoints={[
                { label: 'Debt History (3 years)', url: `${API_URL}/debt/?days=1095`, filename: 'debt_history.json' },
                { label: 'Latest Debt Figure', url: `${API_URL}/debt/latest`, filename: 'debt_latest.json' },
                { label: 'Debt Holders', url: `${API_URL}/debt/holders`, filename: 'debt_holders.json' },
                { label: 'Interest Expense', url: `${API_URL}/debt/interest`, filename: 'debt_interest.json' },
                { label: 'Foreign Holders', url: `${API_URL}/debt/foreign-holders`, filename: 'debt_foreign_holders.json' },
              ]} />
            </div>
          </div>
        </div>
      </div>

      {/* Deep Dive Section */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-mono text-surface-600 mb-2 uppercase tracking-wider">Deep Dive</p>
          <h2 className="text-2xl font-semibold text-foreground">Who Holds Our Debt</h2>
          <p className="text-surface-500 mt-1">Detailed breakdown from FRED, Treasury Fiscal Data, and TIC sources.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 1. Debt Composition (larger pie) */}
          <div className="card p-6">
            <h3 className="text-base font-medium text-foreground mb-4">Debt Composition</h3>
            {holdersLoading || !rc ? (
              <ChartSkeleton height={300} />
            ) : holdersData?.holders ? (
              <>
                <rc.ResponsiveContainer width="100%" height={300}>
                  <rc.PieChart>
                    <rc.Pie
                      data={holdersData.holders.map(h => ({ name: h.name, value: h.amount_billions }))}
                      cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={2} dataKey="value"
                      label={({ name, percent }: { name: string; percent: number }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                    >
                      {holdersData.holders.map((_, idx) => (
                        <rc.Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </rc.Pie>
                    <rc.Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${v.toFixed(0)}B`, 'Holdings']} />
                  </rc.PieChart>
                </rc.ResponsiveContainer>
                <div className="mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-surface-500 font-medium">Holder</th>
                        <th className="text-right py-2 text-surface-500 font-medium">Amount</th>
                        <th className="text-right py-2 text-surface-500 font-medium">Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {holdersData.holders.map((h, idx) => (
                        <tr key={idx}>
                          <td className="py-2 flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                            <span className="text-surface-300">{h.name}</span>
                          </td>
                          <td className="py-2 text-right font-mono text-surface-400">
                            ${h.amount_billions >= 1000 ? `${(h.amount_billions / 1000).toFixed(2)}T` : `${h.amount_billions.toFixed(0)}B`}
                          </td>
                          <td className="py-2 text-right text-surface-500">{h.percent}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-surface-600 mt-3">
                    Total: ${holdersData.total_billions >= 1000 ? `${(holdersData.total_billions / 1000).toFixed(2)}T` : `${holdersData.total_billions.toFixed(0)}B`}
                    {holdersData.as_of_date && ` — As of ${holdersData.as_of_date}`}
                  </p>
                </div>
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-surface-600">No data available</div>
            )}
          </div>

          {/* 2. Holder Trends (10yr) */}
          <div className="card p-6">
            <h3 className="text-base font-medium text-foreground mb-4">Holder Trends (10 Year)</h3>
            {historyLoading || !rc ? (
              <ChartSkeleton height={300} />
            ) : holdersHistory?.series ? (
              <HolderTrendsChart rc={rc} data={holdersHistory.series} tooltipStyle={tooltipStyle} axisStyle={axisStyle} gridStyle={gridStyle} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-surface-600">No data available</div>
            )}
          </div>

          {/* 3. Foreign Holders (horizontal bar) */}
          <div className="card p-6">
            <h3 className="text-base font-medium text-foreground mb-4">Top Foreign Holders</h3>
            {foreignLoading || !rc ? (
              <ChartSkeleton height={400} />
            ) : foreignData?.countries?.length ? (
              <rc.ResponsiveContainer width="100%" height={400}>
                <rc.BarChart
                  data={foreignData.countries.slice(0, 15)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <rc.CartesianGrid {...gridStyle} />
                  <rc.XAxis type="number" {...axisStyle} tickFormatter={(v: number) => `$${v}B`} />
                  <rc.YAxis type="category" dataKey="country" {...axisStyle} width={90} tick={{ fontSize: 11 }} />
                  <rc.Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${v}B`, 'Holdings']} />
                  <rc.Bar dataKey="holdings_billions" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </rc.BarChart>
              </rc.ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-surface-600">No data available</div>
            )}
          </div>

          {/* 4. Interest Expense */}
          <div className="card p-6">
            <h3 className="text-base font-medium text-foreground mb-4">Interest Expense by Fiscal Year</h3>
            {interestLoading || !rc ? (
              <ChartSkeleton height={300} />
            ) : interestData?.annual?.length ? (
              <>
                <rc.ResponsiveContainer width="100%" height={300}>
                  <rc.BarChart data={interestData.annual} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <rc.CartesianGrid {...gridStyle} />
                    <rc.XAxis dataKey="fiscal_year" {...axisStyle} tickFormatter={(v: number) => `FY${String(v).slice(2)}`} />
                    <rc.YAxis {...axisStyle} tickFormatter={(v: number) => `$${(v / 1_000_000_000_000).toFixed(1)}T`} />
                    <rc.Tooltip
                      contentStyle={tooltipStyle}
                      labelFormatter={(v: number) => `Fiscal Year ${v}`}
                      formatter={(v: number) => [`$${(v / 1_000_000_000).toFixed(1)}B`, 'Interest']}
                    />
                    <rc.Bar dataKey="total" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </rc.BarChart>
                </rc.ResponsiveContainer>
                <p className="text-xs text-surface-600 mt-2">Source: Treasury Fiscal Data API</p>
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-surface-600">No data available</div>
            )}
          </div>

          {/* 5. Avg Interest Rates */}
          <div className="card p-6">
            <h3 className="text-base font-medium text-foreground mb-4">Average Interest Rates</h3>
            {ratesLoading ? (
              <ChartSkeleton height={200} />
            ) : ratesData?.rates?.length ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-surface-500 font-medium">Security Type</th>
                        <th className="text-right py-2 text-surface-500 font-medium">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {ratesData.rates.map((r, idx) => (
                        <tr key={idx}>
                          <td className="py-2 text-surface-300">{r.security_type}</td>
                          <td className="py-2 text-right font-mono text-surface-400">{r.rate.toFixed(3)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {ratesData.as_of_date && (
                  <p className="text-xs text-surface-600 mt-3">As of {ratesData.as_of_date}</p>
                )}
              </>
            ) : (
              <div className="py-8 text-center text-surface-600">No data available</div>
            )}
          </div>

          {/* 6. Debt-to-GDP Ratio */}
          <div className="card p-6">
            <h3 className="text-base font-medium text-foreground mb-4">Debt-to-GDP Ratio</h3>
            {gdpLoading || !rc ? (
              <ChartSkeleton height={300} />
            ) : gdpData?.history?.length ? (
              <>
                <rc.ResponsiveContainer width="100%" height={300}>
                  <rc.LineChart data={gdpData.history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <rc.CartesianGrid {...gridStyle} />
                    <rc.XAxis dataKey="date" {...axisStyle} tickFormatter={(v: string) => v.slice(0, 4)} />
                    <rc.YAxis {...axisStyle} tickFormatter={(v: number) => `${v}%`} />
                    <rc.Tooltip
                      contentStyle={tooltipStyle}
                      labelFormatter={(v: string) => v}
                      formatter={(v: number) => [`${v}%`, 'Debt/GDP']}
                    />
                    <rc.Line type="monotone" dataKey="percent" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </rc.LineChart>
                </rc.ResponsiveContainer>
                {gdpData.latest?.percent != null && (
                  <p className="text-xs text-surface-600 mt-2">
                    Latest: {gdpData.latest.percent}% ({gdpData.latest.date})
                  </p>
                )}
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-surface-600">No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Multi-line chart for holder trends — extracted to keep main component readable. */
function HolderTrendsChart({
  rc,
  data,
  tooltipStyle,
  axisStyle,
  gridStyle,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rc: Record<string, any>;
  data: Record<string, Array<{ date: string; value: number }>>;
  tooltipStyle: React.CSSProperties;
  axisStyle: { stroke: string; fontSize: number };
  gridStyle: { strokeDasharray: string; stroke: string };
}) {
  const labels: Record<string, string> = {
    federal_reserve: 'Federal Reserve',
    foreign: 'Foreign & Intl',
    pension_funds: 'Pension Funds',
    state_local: 'State & Local',
    mutual_funds: 'Mutual Funds',
  };

  // Merge all series by date
  const dateMap = new Map<string, Record<string, number>>();
  for (const [key, series] of Object.entries(data)) {
    for (const obs of series) {
      const row = dateMap.get(obs.date) || {};
      row[key] = obs.value;
      dateMap.set(obs.date, row);
    }
  }
  const chartData = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({ date, ...values }));

  const keys = Object.keys(labels);

  return (
    <>
      <rc.ResponsiveContainer width="100%" height={300}>
        <rc.LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <rc.CartesianGrid {...gridStyle} />
          <rc.XAxis dataKey="date" {...axisStyle} tickFormatter={(v: string) => v.slice(0, 4)} />
          <rc.YAxis {...axisStyle} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}T`} />
          <rc.Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(v: string) => v}
            formatter={(v: number, name: string) => [`$${v.toFixed(0)}B`, labels[name] || name]}
          />
          <rc.Legend formatter={(value: string) => labels[value] || value} />
          {keys.map((key, i) => (
            <rc.Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={LINE_COLORS[i % LINE_COLORS.length]}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </rc.LineChart>
      </rc.ResponsiveContainer>
      <p className="text-xs text-surface-600 mt-2">Quarterly data — billions USD</p>
    </>
  );
}

export default function DebtPage() {
  return <ErrorBoundary><DebtPageContent /></ErrorBoundary>;
}
