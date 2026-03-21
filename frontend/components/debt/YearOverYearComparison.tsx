'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, AlertTriangle } from 'lucide-react';
import { useChartTheme } from '@/hooks/useChartTheme';
import { ChartSkeleton } from '@/components/ui/Skeleton';
import { ErrorStateCompact } from '@/components/ui/ErrorState';

const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

interface DebtDataPoint {
  date: string;
  total_debt: number;
}

interface YearComparison {
  year: number;
  startDebt: number;
  endDebt: number;
  change: number;
  percentChange: number;
  avgDailyIncrease: number;
}

// Recharts loaded via single dynamic import
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
          BarChart: mod.BarChart,
          Bar: mod.Bar,
          XAxis: mod.XAxis,
          YAxis: mod.YAxis,
          CartesianGrid: mod.CartesianGrid,
          Tooltip: mod.Tooltip,
          Cell: mod.Cell,
        };
      });
    }
    rcPromise.then(() => setLoaded(true));
  }, []);
  return loaded ? RC : null;
}

export function YearOverYearComparison() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comparisons, setComparisons] = useState<YearComparison[]>([]);

  const { tooltipStyle, axisStyle, gridStyle } = useChartTheme();
  const rc = useRecharts();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch 10 years of debt data
        const response = await fetch(`${API_URL}/debt/?days=3650`);
        if (!response.ok) throw new Error('Failed to fetch debt data');
        
        const data = await response.json();
        const debtData: DebtDataPoint[] = data.data || [];

        // Group data by year and calculate comparisons
        const yearMap = new Map<number, DebtDataPoint[]>();
        
        debtData.forEach(point => {
          const year = new Date(point.date).getFullYear();
          if (!yearMap.has(year)) {
            yearMap.set(year, []);
          }
          yearMap.get(year)!.push(point);
        });

        const yearComparisons: YearComparison[] = [];

        // Calculate year-over-year changes
        for (const [year, points] of yearMap.entries()) {
          if (points.length === 0) continue;
          
          // Sort points by date
          points.sort((a, b) => a.date.localeCompare(b.date));
          
          const startDebt = points[0].total_debt;
          const endDebt = points[points.length - 1].total_debt;
          const change = endDebt - startDebt;
          const percentChange = (change / startDebt) * 100;
          const daysInYear = points.length;
          const avgDailyIncrease = daysInYear > 1 ? change / daysInYear : 0;

          yearComparisons.push({
            year,
            startDebt,
            endDebt,
            change,
            percentChange,
            avgDailyIncrease,
          });
        }

        // Sort by year (most recent first) and take last 8 years
        yearComparisons.sort((a, b) => b.year - a.year);
        setComparisons(yearComparisons.slice(0, 8));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatTrillions = (value: number): string => {
    return (value / 1_000_000_000_000).toFixed(2);
  };

  const formatBillions = (value: number): string => {
    return (value / 1_000_000_000).toFixed(1);
  };

  if (error) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-medium text-foreground mb-4">Year-over-Year Debt Growth</h2>
        <ErrorStateCompact message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-medium text-foreground mb-4">Year-over-Year Debt Growth</h2>
      
      {loading || !rc ? (
        <ChartSkeleton height={300} />
      ) : comparisons.length > 0 ? (
        <>
          {/* Chart */}
          <div className="mb-6">
            <rc.ResponsiveContainer width="100%" height={300}>
              <rc.BarChart data={[...comparisons].reverse()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <rc.CartesianGrid {...gridStyle} />
                <rc.XAxis dataKey="year" {...axisStyle} />
                <rc.YAxis {...axisStyle} tickFormatter={(v: number) => `${v.toFixed(1)}%`} />
                <rc.Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number, name: string) => {
                    if (name === 'percentChange') {
                      return [`${value.toFixed(2)}%`, 'Growth Rate'];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(year: number) => `Year ${year}`}
                />
                <rc.Bar dataKey="percentChange" radius={[4, 4, 0, 0]}>
                  {comparisons.map((entry, index) => (
                    <rc.Cell 
                      key={`cell-${index}`} 
                      fill={entry.percentChange > 0 ? '#ef4444' : '#10b981'} 
                    />
                  ))}
                </rc.Bar>
              </rc.BarChart>
            </rc.ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase">Year</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-surface-500 uppercase">Start Debt</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-surface-500 uppercase">End Debt</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-surface-500 uppercase">Change</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-surface-500 uppercase">% Growth</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-surface-500 uppercase">Daily Avg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {comparisons.map((comp) => (
                  <tr key={comp.year} className="hover:bg-surface-800/50">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{comp.year}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-surface-300">
                      ${formatTrillions(comp.startDebt)}T
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-surface-300">
                      ${formatTrillions(comp.endDebt)}T
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono">
                      <span className={comp.change > 0 ? 'text-red-400' : 'text-green-400'}>
                        {comp.change > 0 ? '+' : ''}${formatBillions(comp.change)}B
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-1">
                        {comp.percentChange > 0 ? (
                          <TrendingUp className="h-3 w-3 text-red-400" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-green-400" />
                        )}
                        <span className={comp.percentChange > 0 ? 'text-red-400' : 'text-green-400'}>
                          {Math.abs(comp.percentChange).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-surface-400">
                      +${formatBillions(Math.abs(comp.avgDailyIncrease))}B
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Insights */}
          <div className="mt-6 bg-surface-900 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-surface-300 mb-2">Key Insights</h3>
                <ul className="text-sm text-surface-500 space-y-1">
                  <li>• Debt growth has been consistently positive across all tracked years</li>
                  <li>• Average annual growth rate over the period: {comparisons.length > 0 ? (comparisons.reduce((acc, comp) => acc + comp.percentChange, 0) / comparisons.length).toFixed(1) : '0'}%</li>
                  <li>• Highest growth: {comparisons.length > 0 ? Math.max(...comparisons.map(c => c.percentChange)).toFixed(1) : '0'}% in {comparisons.find(c => c.percentChange === Math.max(...comparisons.map(comp => comp.percentChange)))?.year}</li>
                  <li>• Most recent year shows {comparisons[0]?.percentChange.toFixed(1)}% growth</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-surface-600">
          No data available for year-over-year comparison
        </div>
      )}
    </div>
  );
}

export default YearOverYearComparison;