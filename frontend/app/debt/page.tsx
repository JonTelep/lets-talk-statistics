'use client';

import { Building2, TrendingUp, DollarSign, Users, Clock, AlertTriangle, RefreshCw, Terminal } from 'lucide-react';
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

// Dark terminal colors for charts
const TERMINAL_PIE_COLORS = ['#00ffff', '#00ff41', '#ffbf00', '#ff0040', '#bf00ff', '#0088ff'];

// Chart skeleton component for dark theme
function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="animate-pulse" style={{ height }}>
      <div className="h-full bg-terminal-surface border border-terminal-border rounded-lg flex items-center justify-center">
        <div className="text-terminal-muted text-sm font-mono">LOADING_CHART...</div>
      </div>
    </div>
  );
}

// Table row skeleton for dark theme
function TableRowSkeleton() {
  return (
    <tr className="border-terminal-border">
      <td className="px-6 py-4"><Skeleton className="h-4 w-12 bg-terminal-surface" /></td>
      <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-16 ml-auto bg-terminal-surface" /></td>
      <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-14 ml-auto bg-terminal-surface" /></td>
      <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-12 ml-auto bg-terminal-surface" /></td>
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
    <div className="min-h-screen bg-terminal-bg bg-terminal-grid">
      {/* Hero Section - Terminal Style */}
      <div className="bg-gradient-to-r from-terminal-surface via-terminal-bg to-terminal-surface border-b border-terminal-cyan relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-terminal bg-grid-20 opacity-30"></div>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Terminal className="h-10 w-10 text-terminal-cyan glow-cyan" />
            <h1 className="text-4xl font-bold text-terminal-cyan glow-cyan font-mono">[NATIONAL_DEBT]</h1>
          </div>
          <p className="text-xl text-terminal-text max-w-3xl font-mono leading-relaxed">
            <span className="text-terminal-green">{'>'}</span> Tracking U.S. national debt in real-time<br/>
            <span className="text-terminal-amber">{'>'}</span> Analyzing debt holders, growth rates, GDP ratios<br/>
            <span className="text-terminal-cyan">{'>'}</span> Source: U.S. Treasury Department [CLASSIFIED]
          </p>
        </div>
      </div>

      {/* Live Counter Section - Terminal Style */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8">
        {loading ? (
          <div className="terminal-card rounded-xl p-8 text-center">
            <div className="animate-pulse">
              <div className="h-4 w-32 bg-terminal-surface mx-auto mb-4"></div>
              <div className="h-16 w-96 bg-terminal-surface mx-auto mb-4"></div>
              <div className="h-4 w-48 bg-terminal-surface mx-auto"></div>
            </div>
          </div>
        ) : error ? (
          <div className="terminal-card rounded-xl p-8 text-center border-glow-cyan">
            <div className="text-terminal-red font-mono">
              [ERROR] Failed to load live data
            </div>
            <button onClick={refetch} className="terminal-button mt-4 px-4 py-2 rounded">
              <RefreshCw className="h-4 w-4 inline mr-2" />
              RETRY_CONNECTION
            </button>
          </div>
        ) : stats ? (
          <div className="terminal-card rounded-xl p-8 text-center border-glow-cyan">
            <p className="text-sm text-terminal-muted mb-2 font-mono">[U.S._NATIONAL_DEBT]</p>
            <p className="text-5xl md:text-6xl font-bold text-terminal-red glow-amber font-mono">
              ${stats.totalDebtTrillions}_TRILLION
            </p>
            <p className="text-sm text-terminal-muted mt-2 font-mono">As of {stats.lastUpdated}</p>
            <div className="mt-6 flex justify-center gap-8 text-sm font-mono">
              <div className="border border-terminal-border bg-terminal-surface/50 p-3 rounded">
                <span className="text-terminal-red font-medium glow-green">+${stats.dailyIncreaseBillions}B</span>
                <div className="text-terminal-muted text-xs">DAILY_INCREASE</div>
              </div>
              <div className="border border-terminal-border bg-terminal-surface/50 p-3 rounded">
                <span className="text-terminal-red font-medium glow-amber">${interestDaily}B</span>
                <div className="text-terminal-muted text-xs">DAILY_INTEREST</div>
              </div>
            </div>
            <p className="text-xs text-terminal-green mt-4 font-mono">
              [✓] LIVE_DATA_STREAM_ACTIVE // treasury.gov.api
            </p>
          </div>
        ) : null}
      </div>

      {/* Disclaimer - Terminal Style */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border border-terminal-amber bg-terminal-surface/30 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-terminal-amber flex-shrink-0 mt-0.5" />
          <div className="text-sm text-terminal-text font-mono">
            <span className="text-terminal-amber font-bold">[DATA_SOURCE]:</span> U.S. Treasury Department - Bureau of the Fiscal Service. 
            "Total Public Debt Outstanding" includes both debt held by the public and intragovernmental holdings.
            {debtData && (
              <div className="mt-1 text-terminal-green text-xs">
                Last sync: {new Date(debtData.fetched_at).toLocaleString()} [UTC]
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Per Person Stats - Terminal Style */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <div className="terminal-card rounded-xl p-6 hover:border-glow-cyan transition-all duration-300">
                <div className="flex items-center gap-2 text-terminal-muted text-sm mb-2 font-mono">
                  <Users className="h-4 w-4 text-terminal-cyan" />
                  DEBT_PER_CITIZEN
                </div>
                <p className="text-2xl font-bold text-terminal-red glow-green font-mono">
                  ${stats?.debtPerCitizen.toLocaleString() || '---'}
                </p>
                <p className="text-xs text-terminal-muted font-mono">Every man, woman, child</p>
              </div>
              
              <div className="terminal-card rounded-xl p-6 hover:border-glow-cyan transition-all duration-300">
                <div className="flex items-center gap-2 text-terminal-muted text-sm mb-2 font-mono">
                  <DollarSign className="h-4 w-4 text-terminal-amber" />
                  DEBT_PER_TAXPAYER
                </div>
                <p className="text-2xl font-bold text-terminal-red glow-amber font-mono">
                  ${stats?.debtPerTaxpayer.toLocaleString() || '---'}
                </p>
                <p className="text-xs text-terminal-muted font-mono">Per tax-filing household</p>
              </div>
              
              <div className="terminal-card rounded-xl p-6 hover:border-glow-cyan transition-all duration-300">
                <div className="flex items-center gap-2 text-terminal-muted text-sm mb-2 font-mono">
                  <TrendingUp className="h-4 w-4 text-terminal-green" />
                  DEBT_TO_GDP_RATIO
                </div>
                <p className="text-2xl font-bold text-terminal-cyan glow-cyan font-mono">
                  {stats?.gdpRatio || '---'}%
                </p>
                <p className="text-xs text-terminal-muted font-mono">Debt exceeds annual GDP</p>
              </div>
              
              <div className="terminal-card rounded-xl p-6 hover:border-glow-cyan transition-all duration-300">
                <div className="flex items-center gap-2 text-terminal-muted text-sm mb-2 font-mono">
                  <Clock className="h-4 w-4 text-terminal-purple" />
                  INTEREST_PAID_FY24
                </div>
                <p className="text-2xl font-bold text-terminal-red glow-green font-mono">$1.13T</p>
                <p className="text-xs text-terminal-muted font-mono">Just to service the debt</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Debt Growth Chart - Terminal Style */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="terminal-card rounded-xl p-6 border-glow-cyan">
          <h2 className="text-lg font-semibold text-terminal-cyan mb-4 font-mono glow-cyan">[DEBT_GROWTH_ANALYSIS]</h2>
          {loading ? (
            <ChartSkeleton height={350} />
          ) : error ? (
            <div className="h-[350px] flex items-center justify-center text-terminal-red font-mono">
              [ERROR] Failed to load chart data
            </div>
          ) : historicalDebt.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={[...historicalDebt].reverse()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="2 2" stroke="rgba(0, 255, 255, 0.1)" />
                <XAxis 
                  dataKey="year" 
                  stroke="#00ffff"
                  fontSize={11}
                  fontFamily="JetBrains Mono"
                />
                <YAxis 
                  stroke="#00ffff"
                  fontSize={11}
                  fontFamily="JetBrains Mono"
                  tickFormatter={(value) => `$${value}T`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111111',
                    border: '1px solid #00ffff',
                    borderRadius: '8px',
                    boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
                    fontFamily: 'JetBrains Mono',
                    color: '#e5e5e5',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}T`, 'TOTAL_DEBT']}
                />
                <Line
                  type="monotone"
                  dataKey="debt"
                  stroke="#00ff41"
                  strokeWidth={2}
                  dot={{ fill: '#00ff41', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, fill: '#00ff41', stroke: '#00ffff', strokeWidth: 2 }}
                  filter="url(#glow)"
                />
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-terminal-muted font-mono">
              [NO_DATA_AVAILABLE]
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Historical Data */}
          <div className="lg:col-span-2">
            <div className="terminal-card rounded-xl border-glow-cyan">
              <div className="px-6 py-4 border-b border-terminal-border flex justify-between items-center">
                <h2 className="text-lg font-semibold text-terminal-cyan font-mono glow-cyan">[HISTORICAL_DEBT_LOG]</h2>
                <Link href="/debt/historical" className="text-sm text-terminal-amber hover:glow-amber font-mono transition-all duration-300">
                  FULL_HISTORY_{'>>'} 
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full font-mono">
                  <thead className="bg-terminal-surface">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-terminal-muted uppercase">YEAR</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-terminal-muted uppercase">TOTAL_DEBT</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-terminal-muted uppercase">DEBT/GDP</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-terminal-muted uppercase">GROWTH</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-terminal-border">
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
                        <td colSpan={4} className="px-6 py-8 text-center text-terminal-red font-mono">
                          [ERROR] Failed to load historical data
                        </td>
                      </tr>
                    ) : historicalDebt.length > 0 ? (
                      historicalDebt.map((row, idx) => {
                        const prevDebt = historicalDebt[idx + 1]?.debt || row.debt;
                        const growth = ((row.debt - prevDebt) / prevDebt * 100).toFixed(1);
                        return (
                          <tr key={idx} className="hover:bg-terminal-surface/30 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-terminal-text">{row.year}</td>
                            <td className="px-6 py-4 text-sm text-right font-medium text-terminal-red glow-green">
                              ${row.debt.toFixed(2)}T
                            </td>
                            <td className="px-6 py-4 text-sm text-right text-terminal-amber">
                              {row.gdpRatio.toFixed(1)}%
                            </td>
                            <td className="px-6 py-4 text-sm text-right">
                              {idx < historicalDebt.length - 1 && parseFloat(growth) !== 0 && (
                                <span className={parseFloat(growth) > 0 ? 'text-terminal-red glow-green' : 'text-terminal-green'}>
                                  {parseFloat(growth) > 0 ? '+' : ''}{growth}%
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-terminal-muted font-mono">
                          [NO_DATA_AVAILABLE]
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Milestones */}
            <div className="mt-8 terminal-card rounded-xl">
              <div className="px-6 py-4 border-b border-terminal-border">
                <h2 className="text-lg font-semibold text-terminal-cyan font-mono glow-cyan">[DEBT_MILESTONES]</h2>
                <p className="text-sm text-terminal-muted font-mono">Time intervals between trillion-dollar thresholds</p>
              </div>
              <div className="p-6">
                <div className="relative">
                  {milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-center mb-6 last:mb-0 group">
                      <div className="w-32 text-right pr-4 font-mono">
                        <p className="text-sm font-bold text-terminal-cyan glow-cyan">{milestone.amount}</p>
                        <p className="text-xs text-terminal-muted">[{milestone.year}]</p>
                      </div>
                      <div className="w-4 h-4 bg-terminal-red rounded-full border-2 border-terminal-cyan z-10 group-hover:animate-pulse" />
                      <div className="ml-4 text-sm text-terminal-amber font-mono">
                        {milestone.daysTo !== '-' && <span>+{milestone.daysTo}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Who Holds the Debt */}
            <div className="terminal-card rounded-xl border-glow-cyan">
              <div className="px-6 py-4 border-b border-terminal-border">
                <h2 className="text-lg font-semibold text-terminal-cyan font-mono glow-cyan">[DEBT_HOLDERS_MATRIX]</h2>
              </div>
              <div className="p-6">
                {/* Pie Chart */}
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={debtHolders.map(h => ({ name: h.holder, value: h.amount }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {debtHolders.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={TERMINAL_PIE_COLORS[idx % TERMINAL_PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111111',
                        border: '1px solid #00ffff',
                        borderRadius: '8px',
                        fontFamily: 'JetBrains Mono',
                        color: '#e5e5e5',
                      }}
                      formatter={(value: number) => [`$${value}T`, 'AMOUNT']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend as list */}
                <div className="mt-4 space-y-3 font-mono">
                  {debtHolders.map((holder, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm hover:bg-terminal-surface/30 p-2 rounded transition-colors">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-sm" 
                          style={{ backgroundColor: TERMINAL_PIE_COLORS[idx % TERMINAL_PIE_COLORS.length] }} 
                        />
                        <span className="text-terminal-text">{holder.holder}</span>
                      </div>
                      <span className="text-terminal-cyan glow-cyan">${holder.amount}T ({holder.percent}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Foreign Holders */}
            <div className="mt-6 terminal-card rounded-xl">
              <div className="px-6 py-4 border-b border-terminal-border">
                <h2 className="text-lg font-semibold text-terminal-cyan font-mono glow-cyan">[FOREIGN_HOLDERS_TOP6]</h2>
              </div>
              <div className="divide-y divide-terminal-border">
                {topForeignHolders.map((country, idx) => (
                  <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-terminal-surface/30 transition-colors font-mono">
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-terminal-muted w-8">#{idx + 1}</span>
                      <span className="text-sm text-terminal-text">{country.country}</span>
                    </div>
                    <span className="text-sm font-medium text-terminal-amber glow-amber">${country.amount}T</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Sources */}
            <div className="mt-6 terminal-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-terminal-cyan mb-4 font-mono glow-cyan">[DATA_SOURCES]</h3>
              <ul className="text-sm text-terminal-text space-y-3 font-mono">
                <li className="hover:text-terminal-cyan transition-colors">
                  {'>'} <a href="https://fiscaldata.treasury.gov/" target="_blank" rel="noopener noreferrer" className="text-terminal-amber hover:glow-amber">Treasury Fiscal Data API</a> [LIVE]
                </li>
                <li className="hover:text-terminal-cyan transition-colors">{'>'} TreasuryDirect.gov [ARCHIVED]</li>
                <li className="hover:text-terminal-cyan transition-colors">{'>'} Bureau of the Fiscal Service [GOV]</li>
                <li className="hover:text-terminal-cyan transition-colors">{'>'} Treasury International Capital (TIC) [INT]</li>
              </ul>
            </div>

            {/* Download Raw Data */}
            <div className="mt-6">
              <div className="terminal-card rounded-xl p-6">
                <h3 className="text-lg font-semibold text-terminal-cyan mb-4 font-mono glow-cyan">[RAW_DATA_EXPORT]</h3>
                <div className="space-y-3">
                  <button className="terminal-button w-full px-4 py-3 rounded text-left font-mono transition-all duration-300">
                    {'>'} DEBT_HISTORY_3Y.json
                  </button>
                  <button className="terminal-button w-full px-4 py-3 rounded text-left font-mono transition-all duration-300">
                    {'>'} DEBT_LATEST.json
                  </button>
                </div>
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