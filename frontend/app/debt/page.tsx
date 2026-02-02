'use client';

import { Building2, TrendingUp, DollarSign, Users, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useDebtHistory, calculateDebtStats, DebtDataPoint } from '@/services/hooks/useDebtData';
import { DownloadRawData } from '@/components/ui/DownloadRawData';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorStateCompact, ErrorStateTableRow } from '@/components/ui/ErrorState';
import { Skeleton, StatCardSkeleton, HeroCounterSkeleton } from '@/components/ui/Skeleton';

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

// Static data that doesn't come from the API (would need additional endpoints)
const debtHolders = [
  { holder: 'Federal Reserve', amount: 5.02, percent: 13.9 },
  { holder: 'Foreign Governments', amount: 7.94, percent: 21.9 },
  { holder: 'Mutual Funds', amount: 3.28, percent: 9.1 },
  { holder: 'State & Local Governments', amount: 1.45, percent: 4.0 },
  { holder: 'Private Pensions', amount: 0.97, percent: 2.7 },
  { holder: 'Other (Banks, Insurance, etc.)', amount: 17.56, percent: 48.4 },
];

const topForeignHolders = [
  { country: 'Japan', amount: 1.08, percent: 13.6 },
  { country: 'China', amount: 0.77, percent: 9.7 },
  { country: 'United Kingdom', amount: 0.72, percent: 9.1 },
  { country: 'Luxembourg', amount: 0.39, percent: 4.9 },
  { country: 'Canada', amount: 0.35, percent: 4.4 },
  { country: 'Belgium', amount: 0.33, percent: 4.2 },
];

const milestones = [
  { amount: '$1 Trillion', year: '1982', daysTo: '-' },
  { amount: '$5 Trillion', year: '1996', daysTo: '5,110 days' },
  { amount: '$10 Trillion', year: '2008', daysTo: '4,380 days' },
  { amount: '$20 Trillion', year: '2017', daysTo: '3,285 days' },
  { amount: '$30 Trillion', year: '2022', daysTo: '1,825 days' },
  { amount: '$35 Trillion', year: '2024', daysTo: '730 days' },
];

// Clean minimal colors for charts
const MINIMAL_PIE_COLORS = ['#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e', '#082f49'];

// Chart skeleton component for clean theme
function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="animate-pulse" style={{ height }}>
      <div className="h-full bg-neutral-50 rounded-xl flex items-center justify-center">
        <div className="text-neutral-400 text-sm font-medium">Loading chart data</div>
      </div>
    </div>
  );
}

// Table row skeleton for clean theme
function TableRowSkeleton() {
  return (
    <tr className="border-neutral-100">
      <td className="px-8 py-6"><Skeleton className="h-4 w-12 bg-neutral-100 rounded-lg" /></td>
      <td className="px-8 py-6 text-right"><Skeleton className="h-4 w-16 ml-auto bg-neutral-100 rounded-lg" /></td>
      <td className="px-8 py-6 text-right"><Skeleton className="h-4 w-14 ml-auto bg-neutral-100 rounded-lg" /></td>
      <td className="px-8 py-6 text-right"><Skeleton className="h-4 w-12 ml-auto bg-neutral-100 rounded-lg" /></td>
    </tr>
  );
}

// Convert API data to yearly format for the table
function aggregateByYear(data: DebtDataPoint[]): Array<{ year: string; debt: number; gdpRatio: number }> {
  const yearlyData: Map<string, { total: number; count: number }> = new Map();
  
  // Group by year and average
  data.forEach((point) => {
    const year = point.date.substring(0, 4);
    const existing = yearlyData.get(year) || { total: 0, count: 0 };
    existing.total += point.total_debt;
    existing.count += 1;
    yearlyData.set(year, existing);
  });
  
  // Convert to array and calculate averages
  const result = Array.from(yearlyData.entries())
    .map(([year, { total, count }]) => {
      const avgDebt = total / count;
      // Rough GDP estimate based on year (simplified)
      const gdpEstimate = 28_000_000_000_000 * (1 + (parseInt(year) - 2024) * 0.025);
      return {
        year,
        debt: avgDebt / 1_000_000_000_000, // Convert to trillions
        gdpRatio: (avgDebt / gdpEstimate) * 100,
      };
    })
    .sort((a, b) => parseInt(b.year) - parseInt(a.year))
    .slice(0, 10);
  
  return result;
}

function DebtPageContent() {
  // Fetch 3 years of data (1095 days)
  const { data: debtData, loading, error, refetch } = useDebtHistory(1095);
  
  const stats = debtData ? calculateDebtStats(debtData.data) : null;
  const historicalDebt = debtData ? aggregateByYear(debtData.data) : [];
  
  // Estimated daily interest (rough calculation based on average interest rate)
  const interestDaily = stats ? (parseFloat(stats.totalDebtTrillions) * 0.03 / 365).toFixed(1) : '3.0';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Clean Minimal */}
      <div className="bg-white border-b border-neutral-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-50/50 to-white"></div>
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-3 mb-8 text-neutral-600">
              <Building2 className="h-8 w-8" />
              <span className="text-sm font-medium tracking-wide uppercase">U.S. Treasury Data</span>
            </div>
            <h1 className="text-6xl font-bold text-gradient mb-6 tracking-tight">
              National Debt
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed font-light">
              Real-time tracking of the United States national debt, providing transparent access to government financial data sourced directly from the Treasury Department.
            </p>
          </div>
        </div>
      </div>

      {/* Live Counter Section - Clean Minimal */}
      <div className="mx-auto max-w-6xl px-6 lg:px-8 -mt-12 mb-24">
        {loading ? (
          <div className="card-minimal p-12 text-center">
            <div className="animate-pulse space-y-6">
              <div className="h-4 w-32 bg-neutral-100 rounded-lg mx-auto"></div>
              <div className="h-16 w-96 bg-neutral-100 rounded-xl mx-auto"></div>
              <div className="h-4 w-48 bg-neutral-100 rounded-lg mx-auto"></div>
            </div>
          </div>
        ) : error ? (
          <div className="card-minimal p-12 text-center">
            <div className="text-danger font-medium mb-4">Failed to load live data</div>
            <button onClick={refetch} className="button-minimal">
              <RefreshCw className="h-4 w-4 inline mr-2" />
              Retry
            </button>
          </div>
        ) : stats ? (
          <div className="card-minimal p-12 text-center">
            <p className="text-sm font-medium text-neutral-500 mb-3 tracking-wide uppercase">Current National Debt</p>
            <p className="text-7xl font-bold text-neutral-900 mb-4 tracking-tight font-feature-numeric">
              ${stats.totalDebtTrillions}<span className="text-4xl text-neutral-600"> trillion</span>
            </p>
            <p className="text-sm text-neutral-500 mb-8">Last updated {stats.lastUpdated}</p>
            <div className="flex justify-center gap-12 text-sm">
              <div className="text-center">
                <div className="text-2xl font-semibold text-neutral-900 mb-1">+${stats.dailyIncreaseBillions}B</div>
                <div className="text-neutral-500 font-medium">Daily increase</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-neutral-900 mb-1">${interestDaily}B</div>
                <div className="text-neutral-500 font-medium">Daily interest</div>
              </div>
            </div>
            <div className="mt-8 inline-flex items-center gap-2 text-xs text-accent-600 bg-accent-50 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></div>
              Live data from U.S. Treasury Fiscal Data API
            </div>
          </div>
        ) : null}
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-6xl px-6 lg:px-8 mb-20">
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 flex items-start gap-4">
          <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-orange-800 font-medium">
            <strong>Data Source:</strong> U.S. Treasury Department - Bureau of the Fiscal Service. 
            Total Public Debt Outstanding includes both debt held by the public and intragovernmental holdings.
            {debtData && (
              <div className="mt-2 text-xs text-accent-600 font-normal">
                Data retrieved: {new Date(debtData.fetched_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mx-auto max-w-6xl px-6 mb-20 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <div className="card-minimal p-8 text-center">
                <div className="flex items-center justify-center gap-2 text-neutral-500 text-sm mb-4">
                  <Users className="h-4 w-4 text-accent-500" />
                  <span className="font-medium">Per Citizen</span>
                </div>
                <p className="text-3xl font-bold text-neutral-900 mb-2 font-feature-numeric">
                  ${stats?.debtPerCitizen.toLocaleString() || '---'}
                </p>
                <p className="text-xs text-neutral-500 font-medium">Every person in America</p>
              </div>
              
              <div className="card-minimal p-8 text-center">
                <div className="flex items-center justify-center gap-2 text-neutral-500 text-sm mb-4">
                  <DollarSign className="h-4 w-4 text-accent-500" />
                  <span className="font-medium">Per Taxpayer</span>
                </div>
                <p className="text-3xl font-bold text-neutral-900 mb-2 font-feature-numeric">
                  ${stats?.debtPerTaxpayer.toLocaleString() || '---'}
                </p>
                <p className="text-xs text-neutral-500 font-medium">Per tax-filing household</p>
              </div>
              
              <div className="card-minimal p-8 text-center">
                <div className="flex items-center justify-center gap-2 text-neutral-500 text-sm mb-4">
                  <TrendingUp className="h-4 w-4 text-accent-500" />
                  <span className="font-medium">Debt-to-GDP</span>
                </div>
                <p className="text-3xl font-bold text-neutral-900 mb-2">
                  {stats?.gdpRatio || '---'}%
                </p>
                <p className="text-xs text-neutral-500 font-medium">Exceeds annual GDP</p>
              </div>
              
              <div className="card-minimal p-8 text-center">
                <div className="flex items-center justify-center gap-2 text-neutral-500 text-sm mb-4">
                  <Clock className="h-4 w-4 text-accent-500" />
                  <span className="font-medium">Interest Paid</span>
                </div>
                <p className="text-3xl font-bold text-neutral-900 mb-2">$1.13T</p>
                <p className="text-xs text-neutral-500 font-medium">Fiscal year 2024</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Debt Growth Chart */}
      <div className="mx-auto max-w-6xl px-6 mb-20 lg:px-8">
        <div className="card-minimal p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Debt Growth Over Time</h2>
            <p className="text-neutral-600 font-light">Historical debt levels by year</p>
          </div>
          {loading ? (
            <ChartSkeleton height={400} />
          ) : error ? (
            <div className="h-[400px] flex items-center justify-center text-neutral-500">
              Failed to load chart data
            </div>
          ) : historicalDebt.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={[...historicalDebt].reverse()}
                margin={{ top: 20, right: 40, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="2 2" stroke="#f4f4f5" />
                <XAxis 
                  dataKey="year" 
                  stroke="#a1a1aa"
                  fontSize={12}
                  fontFamily="Inter"
                  fontWeight="500"
                  tick={{ dy: 10 }}
                />
                <YAxis 
                  stroke="#a1a1aa"
                  fontSize={12}
                  fontFamily="Inter"
                  fontWeight="500"
                  tickFormatter={(value) => `$${value}T`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e4e4e7',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)} trillion`, 'National Debt']}
                />
                <Line
                  type="monotone"
                  dataKey="debt"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  dot={{ fill: '#0ea5e9', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#ffffff', strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-neutral-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-6 pb-24 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Historical Data */}
          <div className="lg:col-span-2 space-y-12">
            <div className="card-minimal overflow-hidden">
              <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">Historical Data</h2>
                  <p className="text-sm text-neutral-500 mt-1">Annual debt levels and growth rates</p>
                </div>
                <Link href="/debt/historical" className="text-sm text-accent-600 hover:text-accent-700 font-medium transition-colors">
                  View all →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Year</th>
                      <th className="px-8 py-4 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">Total Debt</th>
                      <th className="px-8 py-4 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">Debt/GDP</th>
                      <th className="px-8 py-4 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">Growth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {loading ? (
                      <>
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                        <TableRowSkeleton />
                      </>
                    ) : error ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-12 text-center text-neutral-500">
                          Failed to load historical data
                        </td>
                      </tr>
                    ) : historicalDebt.length > 0 ? (
                      historicalDebt.map((row, idx) => {
                        const prevDebt = historicalDebt[idx + 1]?.debt || row.debt;
                        const growth = ((row.debt - prevDebt) / prevDebt * 100).toFixed(1);
                        return (
                          <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                            <td className="px-8 py-6 text-sm font-semibold text-neutral-900">{row.year}</td>
                            <td className="px-8 py-6 text-sm text-right font-bold text-accent-600 font-feature-numeric">
                              ${row.debt.toFixed(2)}T
                            </td>
                            <td className="px-8 py-6 text-sm text-right text-neutral-600 font-medium">
                              {row.gdpRatio.toFixed(1)}%
                            </td>
                            <td className="px-8 py-6 text-sm text-right font-medium">
                              {idx < historicalDebt.length - 1 && parseFloat(growth) !== 0 && (
                                <span className={parseFloat(growth) > 0 ? 'text-danger' : 'text-success'}>
                                  {parseFloat(growth) > 0 ? '+' : ''}{growth}%
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-8 py-12 text-center text-neutral-500">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Milestones */}
            <div className="card-minimal">
              <div className="px-8 py-6 border-b border-neutral-100">
                <h2 className="text-xl font-semibold text-neutral-900">Debt Milestones</h2>
                <p className="text-sm text-neutral-500 mt-1">Time between trillion-dollar thresholds</p>
              </div>
              <div className="p-8">
                <div className="space-y-8">
                  {milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-center group">
                      <div className="w-36 text-right pr-8">
                        <p className="text-lg font-bold text-neutral-900">{milestone.amount}</p>
                        <p className="text-sm text-neutral-500">{milestone.year}</p>
                      </div>
                      <div className="w-6 h-6 bg-accent-500 rounded-full border-4 border-accent-100 z-10 group-hover:scale-110 transition-transform" />
                      <div className="ml-6 text-sm text-neutral-600 font-medium">
                        {milestone.daysTo !== '-' && <span>{milestone.daysTo}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Who Holds the Debt */}
            <div className="card-minimal">
              <div className="px-6 py-6 border-b border-neutral-100">
                <h2 className="text-lg font-semibold text-neutral-900">Debt Holders</h2>
                <p className="text-sm text-neutral-500 mt-1">Who owns U.S. government debt</p>
              </div>
              <div className="p-6">
                {/* Pie Chart */}
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={debtHolders.map(h => ({ name: h.holder, value: h.amount }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {debtHolders.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={MINIMAL_PIE_COLORS[idx % MINIMAL_PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e4e4e7',
                        borderRadius: '8px',
                        fontFamily: 'Inter',
                        fontSize: '14px',
                      }}
                      formatter={(value: number) => [`$${value}T`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend as list */}
                <div className="mt-6 space-y-3">
                  {debtHolders.map((holder, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm hover:bg-neutral-50 p-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-sm" 
                          style={{ backgroundColor: MINIMAL_PIE_COLORS[idx % MINIMAL_PIE_COLORS.length] }} 
                        />
                        <span className="text-neutral-700 font-medium">{holder.holder}</span>
                      </div>
                      <span className="text-accent-600 font-semibold">${holder.amount}T</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Foreign Holders */}
            <div className="card-minimal">
              <div className="px-6 py-6 border-b border-neutral-100">
                <h2 className="text-lg font-semibold text-neutral-900">Foreign Holders</h2>
                <p className="text-sm text-neutral-500 mt-1">Top 6 countries by debt ownership</p>
              </div>
              <div className="divide-y divide-neutral-100">
                {topForeignHolders.map((country, idx) => (
                  <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-neutral-400 w-6">#{idx + 1}</span>
                      <span className="text-sm font-medium text-neutral-700">{country.country}</span>
                    </div>
                    <span className="text-sm font-bold text-accent-600">${country.amount}T</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Sources */}
            <div className="card-minimal p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Data Sources</h3>
              <ul className="text-sm text-neutral-600 space-y-3">
                <li className="hover:text-neutral-900 transition-colors">
                  • <a href="https://fiscaldata.treasury.gov/" target="_blank" rel="noopener noreferrer" className="text-accent-600 hover:text-accent-700 font-medium">Treasury Fiscal Data API</a> (Live)
                </li>
                <li className="hover:text-neutral-900 transition-colors">• TreasuryDirect.gov</li>
                <li className="hover:text-neutral-900 transition-colors">• Bureau of the Fiscal Service</li>
                <li className="hover:text-neutral-900 transition-colors">• Treasury International Capital</li>
              </ul>
            </div>

            {/* Download Raw Data */}
            <div className="card-minimal p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Download Data</h3>
              <div className="space-y-3">
                <button className="button-minimal w-full text-left">
                  Debt History (3 years)
                </button>
                <button className="button-minimal w-full text-left">
                  Latest Debt Data
                </button>
              </div>
            </div>
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