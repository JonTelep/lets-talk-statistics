'use client';

import { Users, ArrowRight, ArrowLeft, AlertTriangle, Calendar, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import {
  LazyLineChart, LazyLine, LazyXAxis, LazyYAxis, LazyCartesianGrid, LazyTooltip, LazyLegend,
} from '@/components/charts';
import {
  useImmigrationSummary,
  useImmigrationHistorical,
  useImmigrationCategories,
  useImmigrationCountries,
} from '@/services/hooks/useImmigrationData';
import { DownloadRawData } from '@/components/ui/DownloadRawData';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorStateCompact } from '@/components/ui/ErrorState';
import { Skeleton, StatCardSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';
import { useChartTheme } from '@/hooks/useChartTheme';

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

function ImmigrationPageContent() {
  const { data: summaryData, loading: summaryLoading, error: summaryError, refetch: refetchSummary } = useImmigrationSummary();
  const { data: historicalData, loading: historicalLoading } = useImmigrationHistorical();
  const { data: categoriesData, loading: categoriesLoading } = useImmigrationCategories();
  const { data: countriesData, loading: countriesLoading } = useImmigrationCountries(10);
  const { tooltipStyle, axisStyle, gridStyle } = useChartTheme();

  const summary = summaryData?.summary;
  const fiscalYear = summaryData?.fiscal_year;
  const ratio = summary?.admission_to_removal_ratio || '—';
  const netMigration = summary?.net_legal_migration || 0;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-mono text-surface-600 mb-4 uppercase tracking-wider">Immigration Analysis</p>
          <h1 className="text-4xl sm:text-5xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Immigration Statistics</h1>
          <p className="text-lg text-surface-500 max-w-2xl">
            Comprehensive data on legal immigration, deportations, and border encounters
            from official U.S. government sources.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-surface-900 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-surface-500">
            <strong className="text-surface-300">Sources:</strong> DHS Immigration Statistics, CBP, ICE ERO.
            Data reflects fiscal years. &quot;Encounters&quot; includes apprehensions and inadmissibles.
            {summaryData && (
              <span className="ml-1 text-green-400"> Fetched: {new Date(summaryData.fetched_at).toLocaleString()}</span>
            )}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-medium" style={{ color: 'var(--text-primary)' }}>
            Key Metrics {fiscalYear ? `(FY ${fiscalYear})` : ''}
          </h2>
          {summaryLoading && <RefreshCw className="h-4 w-4 animate-spin text-surface-500" />}
        </div>

        {summaryError ? (
          <ErrorStateCompact message="Failed to load summary data" onRetry={refetchSummary} className="mb-8" />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {summaryLoading ? (
              <><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>
            ) : (
              <>
                <div className="card p-6">
                  <div className="flex items-center gap-2 text-surface-500 text-sm mb-1">
                    <ArrowRight className="h-4 w-4 text-green-400" />Legal Admissions
                  </div>
                  <p className="text-2xl font-semibold text-green-400">{summary?.legal_admissions?.toLocaleString() || '—'}</p>
                  <p className="text-xs text-surface-600">Lawful Permanent Residents</p>
                </div>
                <div className="card p-6">
                  <div className="flex items-center gap-2 text-surface-500 text-sm mb-1">
                    <ArrowLeft className="h-4 w-4 text-red-400" />Deportations
                  </div>
                  <p className="text-2xl font-semibold text-red-400">{summary?.removals?.toLocaleString() || '—'}</p>
                  <p className="text-xs text-surface-600">Removals by ICE ERO</p>
                </div>
                <div className="card p-6">
                  <div className="flex items-center gap-2 text-surface-500 text-sm mb-1">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />Border Encounters
                  </div>
                  <p className="text-2xl font-semibold text-amber-400">{summary?.border_encounters?.toLocaleString() || '—'}</p>
                  <p className="text-xs text-surface-600">CBP Southwest Border</p>
                </div>
                <div className="card p-6">
                  <div className="flex items-center gap-2 text-surface-500 text-sm mb-1">
                    <Calendar className="h-4 w-4 text-blue-400" />Data Year
                  </div>
                  <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>FY {fiscalYear || '—'}</p>
                  <p className="text-xs text-green-400">✓ Live from API</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="card p-6">
          <h2 className="text-base font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Immigration Trends by Year</h2>
          {historicalLoading ? (
            <ChartSkeleton height={300} />
          ) : historicalData?.data && historicalData.data.length > 0 ? (
            <LazyLineChart
              data={[...historicalData.data].reverse().map(d => ({
                year: `FY ${d.fiscal_year}`,
                admissions: d.legal_admissions,
                removals: d.removals,
                encounters: d.border_encounters,
              }))}
              height={300}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <LazyCartesianGrid {...gridStyle} />
              <LazyXAxis dataKey="year" {...axisStyle} tickFormatter={(v) => v.replace('FY ', "'")} />
              <LazyYAxis {...axisStyle} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <LazyTooltip
                contentStyle={tooltipStyle}
                formatter={(value: any, name: any) => [
                  value.toLocaleString(),
                  name === 'admissions' ? 'Legal Admissions' :
                  name === 'removals' ? 'Deportations' : 'Border Encounters'
                ]}
              />
              <LazyLegend
                formatter={(value) =>
                  value === 'admissions' ? 'Legal Admissions' :
                  value === 'removals' ? 'Deportations' : 'Border Encounters'
                }
              />
              <LazyLine type="monotone" dataKey="admissions" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }} />
              <LazyLine type="monotone" dataKey="removals" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', strokeWidth: 0, r: 3 }} />
              <LazyLine type="monotone" dataKey="encounters" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }} />
            </LazyLineChart>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-surface-600">No historical data available</div>
          )}
        </div>
      </div>

      {/* Ratio Highlight */}
      {!summaryLoading && summary && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
          <div className="card p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>Immigration to Deportation Ratio</h3>
                <p className="text-sm text-surface-500">
                  For every 1 person deported, approximately {ratio.replace(':1', '')} people are legally admitted
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-400 font-mono">{ratio}</p>
                  <p className="text-xs text-surface-600">Ratio</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-400 font-mono">+{netMigration.toLocaleString()}</p>
                  <p className="text-xs text-surface-600">Net Legal Migration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Historical Table */}
            <div className="card">
              <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                <h2 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>Historical Data (by Fiscal Year)</h2>
                <Link href="/immigration/trends" className="text-sm text-accent hover:underline">View trends →</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">Year</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase">Legal Immigration</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase">Removals</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase">Encounters</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase">Ratio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {historicalLoading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i}>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                          <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
                          <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                          <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
                          <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                        </tr>
                      ))
                    ) : historicalData?.data && historicalData.data.length > 0 ? (
                      historicalData.data.map((row, idx) => {
                        const rowRatio = (row.legal_admissions / row.removals).toFixed(1);
                        return (
                          <tr key={idx} className="hover:bg-surface-800/50">
                            <td className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>FY {row.fiscal_year}</td>
                            <td className="px-6 py-4 text-sm text-right font-mono text-green-400">{row.legal_admissions.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-right font-mono text-red-400">{row.removals.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-right font-mono text-amber-400">{row.border_encounters.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-right font-mono text-surface-300">{rowRatio}:1</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-surface-600">No historical data available</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {historicalData && (
                <div className="px-6 py-3 bg-surface-800 text-xs text-surface-600 border-t border-border">
                  Source: {historicalData.source}
                </div>
              )}
            </div>

            {/* Category Breakdown */}
            <div className="mt-8 card">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                  Legal Immigration by Category
                  {categoriesData && ` (FY ${categoriesData.fiscal_year})`}
                </h2>
              </div>
              <div className="p-6">
                {categoriesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-2 w-full rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : categoriesData?.categories && categoriesData.categories.length > 0 ? (
                  <div className="space-y-4">
                    {categoriesData.categories.map((cat, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-surface-300">{cat.category}</span>
                          <span className="font-mono text-surface-500">{cat.count.toLocaleString()} ({cat.percent}%)</span>
                        </div>
                        <div className="w-full bg-surface-800 rounded-full h-2">
                          <div className="bg-green-400 h-2 rounded-full" style={{ width: `${cat.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-surface-600">No category data available</p>
                )}
              </div>
              {categoriesData && (
                <div className="px-6 py-3 bg-surface-800 text-xs text-surface-600 border-t border-border">
                  Total: {categoriesData.total.toLocaleString()} | Source: {categoriesData.source}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Top Source Countries */}
            <div className="card">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                  Top Source Countries
                  {countriesData && ` (FY ${countriesData.fiscal_year})`}
                </h2>
              </div>
              {countriesLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : countriesData?.countries && countriesData.countries.length > 0 ? (
                <div className="divide-y divide-border">
                  {countriesData.countries.map((country, idx) => (
                    <div key={idx} className="px-6 py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm text-surface-600 w-6">#{idx + 1}</span>
                        <span className="text-sm text-surface-300">{country.country}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-mono text-surface-300">{country.admissions.toLocaleString()}</span>
                        <span className="text-xs text-surface-600 ml-2">({country.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-surface-600">No country data available</div>
              )}
              {countriesData && (
                <div className="px-6 py-3 bg-surface-800 text-xs text-surface-600 border-t border-border">
                  Source: {countriesData.source}
                </div>
              )}
            </div>

            {/* Definitions */}
            <div className="mt-6 card p-6">
              <h3 className="text-base font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Key Definitions</h3>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="font-medium text-surface-300">Lawful Permanent Resident (LPR)</dt>
                  <dd className="text-surface-500">Also known as a &quot;Green Card&quot; holder. Authorized to live and work permanently in the U.S.</dd>
                </div>
                <div>
                  <dt className="font-medium text-surface-300">Removal (Deportation)</dt>
                  <dd className="text-surface-500">Formal removal from the U.S. based on immigration law violations.</dd>
                </div>
                <div>
                  <dt className="font-medium text-surface-300">Encounter</dt>
                  <dd className="text-surface-500">Apprehension or contact by CBP at borders. Not all encounters result in admission or removal.</dd>
                </div>
              </dl>
            </div>

            {/* Data Sources */}
            <div className="mt-6 card p-6">
              <h3 className="text-base font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Data Sources</h3>
              <ul className="text-sm text-surface-500 space-y-2">
                <li>• <a href="https://ohss.dhs.gov/topics/immigration/yearbook" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">DHS Immigration Statistics Yearbook</a></li>
                <li>• <a href="https://www.cbp.gov/newsroom/stats" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">CBP Monthly Operational Update</a></li>
                <li>• ICE ERO Annual Report</li>
                <li>• USCIS Immigration Data</li>
              </ul>
              <p className="mt-3 text-xs text-green-400">✓ Data fetched from live API</p>
            </div>

            <div className="mt-6">
              <DownloadRawData endpoints={[
                { label: 'Immigration Summary', url: `${API_URL}/immigration/summary`, filename: 'immigration_summary.json' },
                { label: 'Historical Data', url: `${API_URL}/immigration/historical`, filename: 'immigration_historical.json' },
                { label: 'By Category', url: `${API_URL}/immigration/categories`, filename: 'immigration_categories.json' },
                { label: 'Top Countries', url: `${API_URL}/immigration/countries`, filename: 'immigration_countries.json' },
              ]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ImmigrationPage() {
  return <ErrorBoundary><ImmigrationPageContent /></ErrorBoundary>;
}
