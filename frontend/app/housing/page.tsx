'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useHousingDashboard, useHousingCompare, useHousingSyncStatus } from '@/services/hooks/useHousingData';
import { DownloadRawData } from '@/components/ui/DownloadRawData';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorStateCompact } from '@/components/ui/ErrorState';
import { StatCardSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';
import { useChartTheme } from '@/hooks/useChartTheme';
import type { ComponentType } from 'react';

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

// Date range presets
const DATE_RANGES: Record<string, string> = {
  '5Y': new Date(Date.now() - 5 * 365.25 * 86400000).toISOString().slice(0, 10),
  '10Y': new Date(Date.now() - 10 * 365.25 * 86400000).toISOString().slice(0, 10),
  '20Y': new Date(Date.now() - 20 * 365.25 * 86400000).toISOString().slice(0, 10),
  'All': '1960-01-01',
};

// Chart colours
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

// Chart section definitions
// rightAxisIds: series that belong on a separate right Y-axis (different scale)
interface ChartSection {
  title: string;
  seriesIds: string[];
  rightAxisIds?: string[];
  leftLabel?: string;
  rightLabel?: string;
  leftFormat?: (v: number) => string;
  rightFormat?: (v: number) => string;
}

const CHART_SECTIONS: ChartSection[] = [
  {
    title: 'Construction Pipeline',
    seriesIds: ['PERMIT', 'HOUST', 'UNDCONTSA', 'COMPUTSA'],
    leftFormat: (v) => `${(v / 1000).toFixed(0)}K`,
  },
  {
    title: 'Homeownership by Race',
    seriesIds: ['RHORUSQ156N', 'NHWAHORUSQ156N', 'BOAAAHORUSQ156N', 'HOLHORUSQ156N'],
    leftFormat: (v) => `${v}%`,
  },
  {
    title: 'House Price Indices',
    seriesIds: ['CSUSHPISA', 'USSTHPI', 'MSPUS'],
    rightAxisIds: ['MSPUS'],
    leftLabel: 'Index',
    rightLabel: 'Dollars',
    leftFormat: (v) => v.toLocaleString(),
    rightFormat: (v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`,
  },
  {
    title: 'Vacancy Rates',
    seriesIds: ['RRVRUSQ156N', 'RHVRUSQ156N'],
    leftFormat: (v) => `${v}%`,
  },
  {
    title: 'Mortgage & Affordability',
    seriesIds: ['MORTGAGE30US', 'MORTGAGE15US', 'FIXHAI'],
    rightAxisIds: ['FIXHAI'],
    leftLabel: 'Rate %',
    rightLabel: 'Index',
    leftFormat: (v) => `${v}%`,
    rightFormat: (v) => v.toLocaleString(),
  },
  {
    title: 'New & Existing Home Sales',
    seriesIds: ['HSN1F', 'EXHOSLUSM495S', 'HNFSEPUSSA'],
    rightAxisIds: ['EXHOSLUSM495S'],
    leftLabel: 'Thousands',
    rightLabel: 'Units',
    leftFormat: (v) => `${(v / 1000).toFixed(0)}K`,
    rightFormat: (v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}K`,
  },
];

function formatValue(value: number, units: string): string {
  if (units === 'percent') return `${value.toFixed(1)}%`;
  if (units === 'dollars') {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  }
  if (units.includes('thousands')) return `${value.toFixed(0)}K`;
  if (units.includes("months' supply")) return `${value.toFixed(1)} mo`;
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

// Recharts components loaded via single dynamic import (avoids nested Suspense issues)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let RC: Record<string, ComponentType<any>> | null = null;
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

function CompareChart({
  section,
  startDate,
}: {
  section: ChartSection;
  startDate: string;
}) {
  const { title, seriesIds, rightAxisIds, leftLabel, rightLabel, leftFormat, rightFormat } = section;
  const hasDualAxis = rightAxisIds && rightAxisIds.length > 0;
  const rightSet = new Set(rightAxisIds || []);

  const { data, loading, error, refetch } = useHousingCompare(seriesIds, startDate);
  const { tooltipStyle, axisStyle, gridStyle } = useChartTheme();
  const rc = useRecharts();

  if (error) return <ErrorStateCompact message={`Failed to load ${title}`} onRetry={refetch} />;

  // Transform multi-series into merged rows keyed by date
  const series = data?.series || [];
  const dateMap = new Map<string, Record<string, number>>();
  for (const s of series) {
    for (const obs of s.observations) {
      const row = dateMap.get(obs.date) || {};
      row[s.series_id] = obs.value;
      dateMap.set(obs.date, row);
    }
  }
  const chartData = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({ date, ...values }));

  return (
    <div className="card p-6">
      <h2 className="text-base font-medium mb-4" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      {loading || !rc ? (
        <ChartSkeleton height={300} />
      ) : chartData.length > 0 ? (
        <rc.ResponsiveContainer width="100%" height={300}>
          <rc.LineChart
            data={chartData}
            margin={{ top: 5, right: hasDualAxis ? 60 : 30, left: 20, bottom: 5 }}
          >
            <rc.CartesianGrid {...gridStyle} />
            <rc.XAxis
              dataKey="date"
              {...axisStyle}
              tickFormatter={(v: string) => v.slice(0, 4)}
            />
            <rc.YAxis
              yAxisId="left"
              {...axisStyle}
              tickFormatter={leftFormat}
              label={hasDualAxis && leftLabel ? { value: leftLabel, angle: -90, position: 'insideLeft', style: { fill: axisStyle.stroke, fontSize: 11 } } : undefined}
            />
            {hasDualAxis && (
              <rc.YAxis
                yAxisId="right"
                orientation="right"
                {...axisStyle}
                tickFormatter={rightFormat}
                label={rightLabel ? { value: rightLabel, angle: 90, position: 'insideRight', style: { fill: axisStyle.stroke, fontSize: 11 } } : undefined}
              />
            )}
            <rc.Tooltip
              contentStyle={tooltipStyle}
              labelFormatter={(label: string) => label}
              formatter={(value: any, name: any) => {
                const s = series.find((x) => x.series_id === name);
                const fmt = rightSet.has(name) ? rightFormat : leftFormat;
                const formatted = fmt ? fmt(Number(value)) : Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 });
                return [formatted, s?.title || name];
              }}
            />
            <rc.Legend
              formatter={(value: string) => {
                const s = series.find((x) => x.series_id === value);
                return s?.title || value;
              }}
            />
            {seriesIds.map((sid, i) => (
              <rc.Line
                key={sid}
                type="monotone"
                dataKey={sid}
                yAxisId={rightSet.has(sid) ? 'right' : 'left'}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </rc.LineChart>
        </rc.ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-surface-600">No data available</div>
      )}
    </div>
  );
}

function HousingPageContent() {
  const [range, setRange] = useState<string>('10Y');
  const startDate = DATE_RANGES[range];

  const { data: dashData, loading: dashLoading, error: dashError, refetch: refetchDash } = useHousingDashboard();
  const { data: syncData } = useHousingSyncStatus();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-mono text-surface-600 mb-4 uppercase tracking-wider">Housing Analysis</p>
          <h1 className="text-4xl sm:text-5xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Housing Statistics</h1>
          <p className="text-lg text-surface-500 max-w-2xl">
            Homeownership, construction, prices, vacancies, and mortgage data from the Federal Reserve
            Economic Data (FRED). 60+ time-series covering decades of U.S. housing market history.
          </p>
        </div>
      </div>

      {/* Data freshness */}
      {syncData?.run_finished_at && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-6">
          <p className="text-xs text-surface-600">
            Data last synced: <span className="text-green-400">{new Date(syncData.run_finished_at).toLocaleString()}</span>
            {syncData.series_synced !== undefined && (
              <span className="ml-2">({syncData.series_synced} series, {syncData.observations_upserted?.toLocaleString()} observations)</span>
            )}
          </p>
        </div>
      )}

      {/* Dashboard Cards */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-medium" style={{ color: 'var(--text-primary)' }}>Key Indicators</h2>
          {dashLoading && <RefreshCw className="h-4 w-4 animate-spin text-surface-500" />}
        </div>

        {dashError ? (
          <ErrorStateCompact message="Failed to load dashboard" onRetry={refetchDash} className="mb-8" />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {dashLoading ? (
              <>{Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)}</>
            ) : (
              dashData?.indicators.map((item) => (
                <div key={item.series_id} className="card p-6">
                  <p className="text-sm text-surface-500 mb-1">{item.title}</p>
                  <p className="text-2xl font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>
                    {item.latest_value !== null ? formatValue(item.latest_value, item.units) : '—'}
                  </p>
                  <p className="text-xs text-surface-600 mt-1">
                    {item.latest_date ? new Date(item.latest_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Date Range Selector */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-surface-500 mr-2">Time range:</span>
          {Object.keys(DATE_RANGES).map((key) => (
            <button
              key={key}
              onClick={() => setRange(key)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                range === key
                  ? 'bg-accent text-white'
                  : 'bg-surface-800 text-surface-400 hover:text-surface-200 hover:bg-surface-700'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {CHART_SECTIONS.map((section) => (
              <CompareChart
                key={section.title}
                section={section}
                startDate={startDate}
              />
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Data Sources */}
            <div className="card p-6">
              <h3 className="text-base font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Data Sources</h3>
              <ul className="text-sm text-surface-500 space-y-2">
                <li>
                  {'• '}
                  <a href="https://fred.stlouisfed.org/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                    FRED (Federal Reserve Economic Data)
                  </a>
                </li>
                <li>{'• U.S. Census Bureau (Housing Vacancies)'}</li>
                <li>{'• S&P CoreLogic Case-Shiller'}</li>
                <li>{'• Federal Housing Finance Agency (FHFA)'}</li>
                <li>{'• Bureau of Labor Statistics (CPI)'}</li>
                <li>{'• Freddie Mac (Mortgage Rates)'}</li>
              </ul>
              <p className="mt-3 text-xs text-green-400">{'✓ 60+ series synced from FRED API'}</p>
            </div>

            {/* Key Definitions */}
            <div className="card p-6">
              <h3 className="text-base font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Key Definitions</h3>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="font-medium text-surface-300">Homeownership Rate</dt>
                  <dd className="text-surface-500">Percentage of housing units that are owner-occupied.</dd>
                </div>
                <div>
                  <dt className="font-medium text-surface-300">Housing Starts</dt>
                  <dd className="text-surface-500">Number of new residential construction projects begun. Seasonally adjusted annual rate.</dd>
                </div>
                <div>
                  <dt className="font-medium text-surface-300">Case-Shiller Index</dt>
                  <dd className="text-surface-500">Measures changes in U.S. residential home prices. Base: Jan 2000 = 100.</dd>
                </div>
                <div>
                  <dt className="font-medium text-surface-300">Monthly Supply</dt>
                  <dd className="text-surface-500">Ratio of new houses for sale to new houses sold. Higher = buyer&#39;s market.</dd>
                </div>
                <div>
                  <dt className="font-medium text-surface-300">Affordability Index</dt>
                  <dd className="text-surface-500">Whether a typical family earns enough to qualify for a mortgage on a typical home. 100 = threshold.</dd>
                </div>
              </dl>
            </div>

            {/* Download Raw Data */}
            <DownloadRawData endpoints={[
              { label: 'Dashboard', url: `${API_URL}/housing/dashboard`, filename: 'housing_dashboard.json' },
              { label: 'Construction Pipeline', url: `${API_URL}/housing/compare?series_ids=PERMIT,HOUST,UNDCONTSA,COMPUTSA`, filename: 'housing_construction.json' },
              { label: 'Mortgage Rates', url: `${API_URL}/housing/compare?series_ids=MORTGAGE30US,MORTGAGE15US`, filename: 'housing_mortgage.json' },
              { label: 'Sync Status', url: `${API_URL}/housing/sync/status`, filename: 'housing_sync_status.json' },
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HousingPage() {
  return <ErrorBoundary><HousingPageContent /></ErrorBoundary>;
}
