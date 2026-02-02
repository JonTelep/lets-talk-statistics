'use client';

import { Building2, TrendingUp, DollarSign, Users, Clock, AlertTriangle, RefreshCw, Quote } from 'lucide-react';
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

// Bold editorial colors for charts
const EDITORIAL_PIE_COLORS = ['#dc267f', '#2563eb', '#059669', '#d97706', '#7c3aed', '#dc2626'];

// Chart skeleton component for editorial theme
function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="animate-pulse" style={{ height }}>
      <div className="h-full bg-white border-2 border-editorial-stone/10 rounded flex items-center justify-center">
        <div className="text-editorial-stone/40 text-sm font-serif italic">Loading editorial visualization</div>
      </div>
    </div>
  );
}

// Table row skeleton for editorial theme
function TableRowSkeleton() {
  return (
    <tr className="border-editorial-stone/20">
      <td className="px-8 py-6"><Skeleton className="h-5 w-16 bg-editorial-cream rounded" /></td>
      <td className="px-8 py-6 text-right"><Skeleton className="h-5 w-20 ml-auto bg-editorial-cream rounded" /></td>
      <td className="px-8 py-6 text-right"><Skeleton className="h-5 w-16 ml-auto bg-editorial-cream rounded" /></td>
      <td className="px-8 py-6 text-right"><Skeleton className="h-5 w-14 ml-auto bg-editorial-cream rounded" /></td>
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
    <div className="min-h-screen bg-editorial-cream">
      {/* Editorial Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgb(28 25 23) 35px, rgb(28 25 23) 70px)`
          }}></div>
        </div>
        
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-32 lg:px-8">
          <div className="layout-magazine">
            {/* Main headline */}
            <div className="col-span-magazine-8">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 text-sm font-sans font-bold uppercase tracking-widest text-editorial-stone/60 mb-4">
                  <Building2 className="h-4 w-4" />
                  Treasury Analysis
                </div>
                <h1 className="headline-main mb-6">
                  America's Growing
                  <span className="text-editorial-red block">Debt Crisis</span>
                </h1>
                <p className="subhead max-w-2xl">
                  An in-depth examination of the United States' mounting national debt, 
                  its implications for future generations, and the urgent questions 
                  facing policymakers as we approach unprecedented fiscal territory.
                </p>
              </div>
            </div>

            {/* Pull quote sidebar */}
            <div className="col-span-magazine-4">
              <div className="sticky top-8">
                <div className="stat-emphasis">
                  <div className="text-center">
                    {loading ? (
                      <div className="animate-pulse">
                        <div className="h-16 w-32 bg-editorial-red/20 rounded mx-auto mb-4"></div>
                        <div className="h-4 w-24 bg-editorial-red/20 rounded mx-auto"></div>
                      </div>
                    ) : stats ? (
                      <>
                        <div className="data-highlight font-feature-numeric mb-2">
                          ${stats.totalDebtTrillions}T
                        </div>
                        <p className="text-sm font-serif font-semibold text-editorial-stone/70 uppercase tracking-wider">
                          National Debt Today
                        </p>
                        <div className="mt-4 pt-4 border-t border-editorial-red/30 text-xs font-sans text-editorial-stone/60">
                          Updated: {stats.lastUpdated}
                        </div>
                      </>
                    ) : (
                      <div className="text-editorial-red font-headline text-2xl">Loading...</div>
                    )}
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <Quote className="h-8 w-8 text-editorial-red/30 mx-auto mb-4" />
                  <blockquote className="pullquote text-lg">
                    Every American owes over ${stats?.debtPerCitizen.toLocaleString() || '100,000'} 
                    in federal debt
                  </blockquote>
                  <cite className="block mt-4 text-sm font-sans font-medium text-editorial-stone/60">
                    — Based on current population estimates
                  </cite>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Data Section */}
      <div className="bg-white border-y-3 border-editorial-stone/20 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {loading ? (
            <div className="text-center animate-pulse">
              <div className="h-8 w-48 bg-editorial-stone/20 rounded mx-auto mb-8"></div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {[1,2,3,4].map(i => (
                  <div key={i} className="text-center">
                    <div className="h-12 w-24 bg-editorial-stone/20 rounded mx-auto mb-2"></div>
                    <div className="h-4 w-20 bg-editorial-stone/20 rounded mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-editorial-red font-headline text-2xl mb-4">Data Unavailable</div>
              <button onClick={refetch} className="button-editorial">
                <RefreshCw className="h-4 w-4 inline mr-2" />
                Retry Connection
              </button>
            </div>
          ) : (
            <div>
              <div className="text-center mb-12">
                <h2 className="headline-section text-editorial-stone mb-4">The Numbers</h2>
                <p className="font-serif text-lg text-editorial-stone/70 max-w-2xl mx-auto">
                  Real-time fiscal data from the U.S. Treasury Department, updated daily to reflect the current state of American debt.
                </p>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center hover-lift">
                  <div className="mb-4">
                    <Users className="h-8 w-8 text-editorial-blue mx-auto mb-2" />
                    <div className="font-headline text-4xl font-bold text-editorial-stone mb-1 font-feature-numeric">
                      ${stats?.debtPerCitizen.toLocaleString() || '---'}
                    </div>
                    <div className="font-sans text-sm font-bold uppercase tracking-wider text-editorial-stone/60">
                      Per Citizen
                    </div>
                  </div>
                </div>
                
                <div className="text-center hover-lift">
                  <div className="mb-4">
                    <DollarSign className="h-8 w-8 text-editorial-emerald mx-auto mb-2" />
                    <div className="font-headline text-4xl font-bold text-editorial-stone mb-1 font-feature-numeric">
                      ${stats?.debtPerTaxpayer.toLocaleString() || '---'}
                    </div>
                    <div className="font-sans text-sm font-bold uppercase tracking-wider text-editorial-stone/60">
                      Per Taxpayer
                    </div>
                  </div>
                </div>
                
                <div className="text-center hover-lift">
                  <div className="mb-4">
                    <TrendingUp className="h-8 w-8 text-editorial-red mx-auto mb-2" />
                    <div className="font-headline text-4xl font-bold text-editorial-stone mb-1">
                      {stats?.gdpRatio || '---'}%
                    </div>
                    <div className="font-sans text-sm font-bold uppercase tracking-wider text-editorial-stone/60">
                      Of GDP
                    </div>
                  </div>
                </div>
                
                <div className="text-center hover-lift">
                  <div className="mb-4">
                    <Clock className="h-8 w-8 text-editorial-gold mx-auto mb-2" />
                    <div className="font-headline text-4xl font-bold text-editorial-stone mb-1">
                      $1.13T
                    </div>
                    <div className="font-sans text-sm font-bold uppercase tracking-wider text-editorial-stone/60">
                      Annual Interest
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 text-center">
                <div className="inline-flex items-center gap-4 bg-editorial-stone/5 px-6 py-3 rounded-full">
                  <div className="w-3 h-3 bg-editorial-emerald rounded-full animate-pulse"></div>
                  <span className="font-serif text-sm font-semibold text-editorial-stone/70">
                    Live data from U.S. Treasury • Last updated {stats?.lastUpdated}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editorial Analysis Section */}
      <div className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="layout-magazine gap-12">
            {/* Main content */}
            <div className="col-span-magazine-8">
              {/* Debt Growth Chart */}
              <div className="card-editorial p-8 mb-16">
                <div className="mb-8">
                  <h2 className="headline-section text-editorial-stone mb-4">A Trajectory of Growth</h2>
                  <p className="body-text">
                    The exponential nature of America's debt accumulation tells a story of changing fiscal priorities, 
                    economic crises, and the increasing cost of government operations. Each decade brings new challenges 
                    that push the debt ceiling ever higher.
                  </p>
                </div>
                
                {loading ? (
                  <ChartSkeleton height={450} />
                ) : error ? (
                  <div className="h-[450px] flex items-center justify-center border-2 border-editorial-red/20 rounded bg-editorial-red/5">
                    <div className="text-center">
                      <div className="text-editorial-red font-headline text-xl mb-2">Chart Data Unavailable</div>
                      <button onClick={refetch} className="button-editorial-outline">
                        Reload Data
                      </button>
                    </div>
                  </div>
                ) : historicalDebt.length > 0 ? (
                  <ResponsiveContainer width="100%" height={450}>
                    <LineChart
                      data={[...historicalDebt].reverse()}
                      margin={{ top: 30, right: 50, left: 30, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1c191799" opacity={0.2} />
                      <XAxis 
                        dataKey="year" 
                        stroke="#1c1917"
                        fontSize={14}
                        fontFamily="Source Serif Pro"
                        fontWeight="600"
                        tick={{ dy: 10 }}
                      />
                      <YAxis 
                        stroke="#1c1917"
                        fontSize={14}
                        fontFamily="Source Serif Pro"
                        fontWeight="600"
                        tickFormatter={(value) => `$${value}T`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '2px solid #dc267f',
                          borderRadius: '8px',
                          boxShadow: '0 8px 32px rgba(220, 38, 127, 0.15)',
                          fontFamily: 'Source Serif Pro',
                          fontSize: '16px',
                          fontWeight: '600',
                        }}
                        formatter={(value: number) => [`$${value.toFixed(2)} trillion`, 'National Debt']}
                      />
                      <Line
                        type="monotone"
                        dataKey="debt"
                        stroke="#dc267f"
                        strokeWidth={4}
                        dot={{ fill: '#dc267f', strokeWidth: 3, r: 6 }}
                        activeDot={{ r: 8, fill: '#dc267f', stroke: '#ffffff', strokeWidth: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[450px] flex items-center justify-center border-2 border-editorial-stone/20 rounded bg-editorial-stone/5">
                    <div className="text-editorial-stone/60 font-serif italic text-lg">No data available for visualization</div>
                  </div>
                )}
              </div>

              {/* Historical Data Table */}
              <div className="card-editorial overflow-hidden">
                <div className="px-8 py-6 border-b-3 border-editorial-stone/10 bg-editorial-stone/5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="font-headline text-2xl font-bold text-editorial-stone mb-2">Historical Record</h2>
                      <p className="font-serif text-editorial-stone/70">Annual debt levels and growth patterns</p>
                    </div>
                    <Link href="/debt/historical" className="button-editorial-outline">
                      Complete Archive
                    </Link>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-editorial-stone/10 border-b-2 border-editorial-stone/20">
                      <tr>
                        <th className="px-8 py-6 text-left font-sans font-bold text-sm uppercase tracking-wider text-editorial-stone">Year</th>
                        <th className="px-8 py-6 text-right font-sans font-bold text-sm uppercase tracking-wider text-editorial-stone">Total Debt</th>
                        <th className="px-8 py-6 text-right font-sans font-bold text-sm uppercase tracking-wider text-editorial-stone">Debt/GDP</th>
                        <th className="px-8 py-6 text-right font-sans font-bold text-sm uppercase tracking-wider text-editorial-stone">Growth</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-editorial-stone/10">
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
                          <td colSpan={4} className="px-8 py-16 text-center">
                            <div className="text-editorial-red font-headline text-xl mb-2">Historical Data Unavailable</div>
                            <button onClick={refetch} className="button-editorial-outline">
                              Reload Data
                            </button>
                          </td>
                        </tr>
                      ) : historicalDebt.length > 0 ? (
                        historicalDebt.map((row, idx) => {
                          const prevDebt = historicalDebt[idx + 1]?.debt || row.debt;
                          const growth = ((row.debt - prevDebt) / prevDebt * 100).toFixed(1);
                          return (
                            <tr key={idx} className="hover:bg-editorial-stone/5 transition-colors group">
                              <td className="px-8 py-6 font-headline text-lg font-bold text-editorial-stone">{row.year}</td>
                              <td className="px-8 py-6 text-right font-headline text-xl font-bold text-editorial-red font-feature-numeric">
                                ${row.debt.toFixed(2)}T
                              </td>
                              <td className="px-8 py-6 text-right font-serif text-lg font-semibold text-editorial-stone/80">
                                {row.gdpRatio.toFixed(1)}%
                              </td>
                              <td className="px-8 py-6 text-right font-sans text-sm font-bold">
                                {idx < historicalDebt.length - 1 && parseFloat(growth) !== 0 && (
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                    parseFloat(growth) > 0 
                                      ? 'bg-editorial-red/10 text-editorial-red' 
                                      : 'bg-editorial-emerald/10 text-editorial-emerald'
                                  }`}>
                                    {parseFloat(growth) > 0 ? '+' : ''}{growth}%
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-8 py-16 text-center text-editorial-stone/60 font-serif italic">
                            No historical data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar content */}
            <div className="col-span-magazine-4 space-y-8">
              {/* Debt Holders */}
              <div className="card-editorial">
                <div className="px-6 py-6 border-b-2 border-editorial-stone/10">
                  <h3 className="font-headline text-xl font-bold text-editorial-stone">Who Owns America's Debt?</h3>
                  <p className="text-sm font-serif text-editorial-stone/70 mt-2">Breakdown by holder type</p>
                </div>
                <div className="p-6">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={debtHolders.map(h => ({ name: h.holder, value: h.amount }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {debtHolders.map((_, idx) => (
                          <Cell key={`cell-${idx}`} fill={EDITORIAL_PIE_COLORS[idx % EDITORIAL_PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '2px solid #1c1917',
                          borderRadius: '4px',
                          fontFamily: 'Source Serif Pro',
                          fontSize: '14px',
                          fontWeight: '600',
                        }}
                        formatter={(value: number) => [`$${value}T`, 'Amount']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-6 space-y-3">
                    {debtHolders.map((holder, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-editorial-stone/10 last:border-b-0 hover:bg-editorial-stone/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-sm" 
                            style={{ backgroundColor: EDITORIAL_PIE_COLORS[idx % EDITORIAL_PIE_COLORS.length] }} 
                          />
                          <span className="font-serif text-sm text-editorial-stone/80">{holder.holder}</span>
                        </div>
                        <span className="font-headline font-bold text-editorial-stone">${holder.amount}T</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Foreign Holders */}
              <div className="card-editorial">
                <div className="px-6 py-6 border-b-2 border-editorial-stone/10">
                  <h3 className="font-headline text-xl font-bold text-editorial-stone">Foreign Creditors</h3>
                  <p className="text-sm font-serif text-editorial-stone/70 mt-2">Top international holders</p>
                </div>
                <div className="divide-y divide-editorial-stone/10">
                  {topForeignHolders.map((country, idx) => (
                    <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-editorial-stone/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="font-headline font-bold text-sm text-editorial-stone/40 w-6">#{idx + 1}</span>
                        <span className="font-serif text-sm font-semibold text-editorial-stone">{country.country}</span>
                      </div>
                      <span className="font-headline font-bold text-editorial-red">${country.amount}T</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div className="card-editorial">
                <div className="px-6 py-6 border-b-2 border-editorial-stone/10">
                  <h3 className="font-headline text-xl font-bold text-editorial-stone">Debt Milestones</h3>
                  <p className="text-sm font-serif text-editorial-stone/70 mt-2">Time between trillion-dollar marks</p>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {milestones.map((milestone, idx) => (
                      <div key={idx} className="flex items-center gap-4 group hover:bg-editorial-stone/5 -mx-2 px-2 py-2 rounded transition-colors">
                        <div className="text-right min-w-[5rem]">
                          <div className="font-headline text-lg font-bold text-editorial-stone">{milestone.amount}</div>
                          <div className="text-xs font-sans font-bold uppercase tracking-wider text-editorial-stone/60">{milestone.year}</div>
                        </div>
                        <div className="w-4 h-4 bg-editorial-red rounded-full border-4 border-editorial-red/30 group-hover:scale-110 transition-transform" />
                        <div className="text-sm font-serif text-editorial-stone/70">
                          {milestone.daysTo !== '-' && <span>{milestone.daysTo}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data Sources */}
              <div className="card-editorial p-6">
                <h4 className="font-headline text-lg font-bold text-editorial-stone mb-4">Sources & Methods</h4>
                <ul className="space-y-3 text-sm font-serif text-editorial-stone/80">
                  <li className="hover:text-editorial-stone transition-colors">
                    • <a href="https://fiscaldata.treasury.gov/" target="_blank" rel="noopener noreferrer" className="text-editorial-red hover:underline font-semibold">U.S. Treasury Fiscal Data API</a>
                  </li>
                  <li className="hover:text-editorial-stone transition-colors">• Bureau of the Fiscal Service</li>
                  <li className="hover:text-editorial-stone transition-colors">• TreasuryDirect.gov Archives</li>
                  <li className="hover:text-editorial-stone transition-colors">• Treasury International Capital Reports</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="border-t-3 border-editorial-stone/20 bg-editorial-stone py-16">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="font-headline text-4xl font-bold text-editorial-cream mb-6">
            The Story Continues
          </h2>
          <p className="font-serif text-lg text-editorial-cream/80 mb-8">
            This is just one chapter in America's ongoing fiscal narrative. 
            Explore more government data and continue following the story that affects every citizen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-editorial-red text-editorial-cream px-8 py-4 font-sans font-bold uppercase tracking-wider text-sm hover:bg-editorial-red/90 transition-colors">
              Download Raw Data
            </button>
            <Link href="/" className="bg-transparent text-editorial-cream border-2 border-editorial-cream px-8 py-4 font-sans font-bold uppercase tracking-wider text-sm hover:bg-editorial-cream hover:text-editorial-stone transition-colors">
              Explore All Data
            </Link>
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