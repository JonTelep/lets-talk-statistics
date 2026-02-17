'use client';

import { Building2, TrendingUp, DollarSign, Users, Clock, AlertTriangle, Warning } from 'lucide-react';
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
  { holder: 'FEDERAL RESERVE', amount: 5.02, percent: 13.9, threat: 'MEDIUM' },
  { holder: 'FOREIGN GOVERNMENTS', amount: 7.94, percent: 21.9, threat: 'HIGH' },
  { holder: 'MUTUAL FUNDS', amount: 3.28, percent: 9.1, threat: 'LOW' },
  { holder: 'STATE & LOCAL GOVTS', amount: 1.45, percent: 4.0, threat: 'LOW' },
  { holder: 'PRIVATE PENSIONS', amount: 0.97, percent: 2.7, threat: 'LOW' },
  { holder: 'OTHER', amount: 17.56, percent: 48.4, threat: 'UNKNOWN' },
];

const topForeignHolders = [
  { country: 'JAPAN', amount: 1.08, status: 'ALLY' },
  { country: 'CHINA', amount: 0.77, status: 'RIVAL' },
  { country: 'UNITED KINGDOM', amount: 0.72, status: 'ALLY' },
  { country: 'LUXEMBOURG', amount: 0.39, status: 'ALLY' },
  { country: 'CANADA', amount: 0.35, status: 'ALLY' },
  { country: 'BELGIUM', amount: 0.33, status: 'ALLY' },
];

const milestones = [
  { amount: '$1T', year: '1982', days: '—', era: 'REAGAN' },
  { amount: '$5T', year: '1996', days: '5,110', era: 'CLINTON' },
  { amount: '$10T', year: '2008', days: '4,380', era: 'BUSH' },
  { amount: '$20T', year: '2017', days: '3,285', era: 'TRUMP' },
  { amount: '$30T', year: '2022', days: '1,825', era: 'BIDEN' },
  { amount: '$35T', year: '2024', days: '730', era: 'BIDEN' },
];

const getThreatColor = (threat: string) => {
  switch (threat) {
    case 'HIGH': return 'text-red-500';
    case 'MEDIUM': return 'text-orange-500';
    case 'LOW': return 'text-green-500';
    case 'UNKNOWN': return 'text-yellow-500';
    default: return 'text-surface-400';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'RIVAL': return 'text-red-500';
    case 'ALLY': return 'text-green-500';
    default: return 'text-surface-400';
  }
};

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
    <div className="min-h-screen bg-surface">
      {/* THREAT LEVEL HEADER */}
      <div className="border-b-4 border-red-500 bg-surface-950 px-4 sm:px-6 lg:px-8 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Warning className="h-6 w-6 text-red-500 animate-pulse" />
            <div className="font-mono text-sm">
              <span className="text-red-500 font-bold">THREAT LEVEL: </span>
              <span className="text-text-primary">CRITICAL</span>
            </div>
          </div>
          <div className="font-mono text-xs text-surface-400">
            LAST_UPDATE: REAL-TIME | SOURCE: US_TREASURY
          </div>
        </div>
      </div>

      {/* BRUTALIST HERO */}
      <div className="px-4 sm:px-6 lg:px-8 pt-20 pb-16 bg-grid relative">
        <div className="absolute inset-0 bg-surface/95"></div>
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <Building2 className="h-8 w-8 text-accent" />
              <span className="text-brutal text-accent text-sm">NATIONAL DEBT MONITORING</span>
            </div>
          </div>
          
          <h1 className="text-brutal mb-8 leading-none">
            DEBT STATUS:
            <br />
            <span className="text-red-500">$35+ TRILLION</span>
          </h1>
          
          <div className="divider-brutal mb-8"></div>
          
          <p className="text-lg text-secondary max-w-3xl mb-12 leading-tight font-mono">
            REAL-TIME TRACKING OF U.S. FEDERAL DEBT FROM TREASURY DEPARTMENT DATA.
            <br />
            ANALYSIS OF DEBT HOLDERS, GROWTH PATTERNS, AND GDP RATIOS.
          </p>
        </div>
      </div>

      {/* LIVE DATA FEED */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <HeroCounterSkeleton />
        ) : error ? (
          <div className="card-brutal p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <div className="text-brutal text-lg mb-4 text-red-500">DATA FEED ERROR</div>
            <ErrorStateCompact 
              error={error} 
              onRetry={refetch} 
              context="debt data"
            />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* MAIN DEBT COUNTER */}
            <div className="lg:col-span-2 card-brutal p-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="text-brutal text-sm text-surface-400 mb-2">CURRENT_DEBT</div>
                  <div className="text-brutal text-4xl text-text-primary">
                    ${stats?.totalDebtTrillions}T
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-brutal text-xs text-surface-400 mb-2">STATUS</div>
                  <div className="text-red-500 font-mono font-bold text-sm animate-pulse">
                    INCREASING
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6 border-t-2 border-surface-700 pt-6">
                <div>
                  <div className="text-xs font-mono text-surface-400 mb-1">DAILY_INTEREST</div>
                  <div className="text-data text-xl text-red-400">${interestDaily}B</div>
                </div>
                <div>
                  <div className="text-xs font-mono text-surface-400 mb-1">VS_GDP</div>
                  <div className="text-data text-xl text-orange-500">
                    {stats?.gdpRatio}%
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono text-surface-400 mb-1">PER_CITIZEN</div>
                  <div className="text-data text-xl text-text-primary">
                    ${stats?.perCitizen ? Math.round(parseFloat(stats.perCitizen.replace(/,/g, ''))).toLocaleString() : '106,000'}
                  </div>
                </div>
              </div>
            </div>

            {/* SYSTEM ALERTS */}
            <div className="space-y-4">
              <div className="card border-red-500 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-red-500 animate-pulse"></div>
                  <span className="text-brutal text-xs text-red-500">HIGH_PRIORITY</span>
                </div>
                <div className="text-sm text-text-primary font-mono mb-2">
                  Debt ceiling suspended until January 2025
                </div>
                <div className="text-xs text-surface-400 font-mono">
                  Congressional action required
                </div>
              </div>
              
              <div className="card border-orange-500 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-orange-500"></div>
                  <span className="text-brutal text-xs text-orange-500">MEDIUM</span>
                </div>
                <div className="text-sm text-text-primary font-mono mb-2">
                  Interest payments exceed $1T annually
                </div>
                <div className="text-xs text-surface-400 font-mono">
                  Largest federal expense
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DEBT HOLDERS - TERMINAL TABLE */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-brutal text-xl mb-2">DEBT_HOLDERS</h2>
              <div className="text-xs font-mono text-surface-400">WHO OWNS AMERICA'S DEBT</div>
            </div>
            <div className="text-xs font-mono text-surface-500">
              $ debt_analysis --holders --live
            </div>
          </div>
          
          <div className="table-brutal">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">HOLDER</th>
                  <th className="text-right">AMOUNT_T</th>
                  <th className="text-right">PERCENT</th>
                  <th className="text-right">THREAT</th>
                </tr>
              </thead>
              <tbody>
                {debtHolders.map((holder) => (
                  <tr key={holder.holder} className="hover:bg-surface-800">
                    <td className="font-mono font-medium">{holder.holder}</td>
                    <td className="text-right font-mono">${holder.amount.toFixed(2)}T</td>
                    <td className="text-right font-mono">{holder.percent}%</td>
                    <td className={`text-right font-mono font-bold ${getThreatColor(holder.threat)}`}>
                      {holder.threat}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOREIGN HOLDERS - SECURITY ANALYSIS */}
        <div className="mb-16">
          <div className="border-l-4 border-red-500 pl-6 mb-8">
            <h2 className="text-brutal text-xl mb-2 text-red-400">FOREIGN_DEBT_HOLDERS</h2>
            <div className="text-xs font-mono text-surface-400">GEOPOLITICAL RISK ASSESSMENT</div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {topForeignHolders.map((holder) => (
              <div key={holder.country} className="card border-surface-600 p-6 hover:border-accent">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-brutal text-sm">{holder.country}</div>
                  <div className={`text-xs font-mono font-bold ${getStatusColor(holder.status)}`}>
                    [{holder.status}]
                  </div>
                </div>
                <div className="text-2xl font-mono font-bold text-text-primary mb-2">
                  ${holder.amount}T
                </div>
                <div className="text-xs font-mono text-surface-400">
                  DEBT_HOLDING
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HISTORICAL MILESTONES */}
        <div className="mb-16">
          <div className="mb-8">
            <h2 className="text-brutal text-xl mb-2">DEBT_MILESTONES</h2>
            <div className="text-xs font-mono text-surface-400">ACCELERATION ANALYSIS</div>
          </div>
          
          <div className="space-y-2">
            {milestones.map((milestone, index) => (
              <div key={milestone.amount} className="flex items-center gap-6 py-4 border-b border-surface-800 hover:bg-surface-900 px-4">
                <div className="text-brutal text-lg w-20">{milestone.amount}</div>
                <div className="text-data text-surface-300 w-16">{milestone.year}</div>
                <div className="text-xs font-mono text-surface-400 w-20">{milestone.days} DAYS</div>
                <div className="text-xs font-mono text-surface-500">{milestone.era}</div>
                <div className="flex-1 text-right">
                  {index === 0 && (
                    <span className="text-xs font-mono text-red-500 animate-pulse">← CURRENT</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DATA DOWNLOAD */}
        <div className="border-t-4 border-accent pt-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-brutal text-sm mb-2">RAW_DATA_ACCESS</div>
              <div className="text-xs font-mono text-surface-400">
                DOWNLOAD COMPLETE DATASET FOR INDEPENDENT ANALYSIS
              </div>
            </div>
            <DownloadRawData 
              endpoint={`${API_URL}/debt/history`} 
              filename="debt_data.json"
              className="btn-accent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DebtPage() {
  return (
    <ErrorBoundary>
      <DebtPageContent />
    </ErrorBoundary>
  );
}