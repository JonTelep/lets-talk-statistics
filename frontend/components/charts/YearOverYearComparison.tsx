/**
 * Year-over-year comparison component for government data
 * Provides side-by-side comparison of metrics across different years
 */

'use client';

import { useMemo } from 'react';
import Card from '../ui/Card';
import { LazyLineChart } from './LazyLineChart';
import { useChartTheme } from '../../hooks/useChartTheme';
import { CHART_COLORS } from './theme';
import { formatCurrency, formatPercent } from '../../utils/format';

interface ComparisonDataPoint {
  period: string; // Date or period identifier
  value: number;
  year: number;
}

interface YearOverYearProps {
  data: ComparisonDataPoint[];
  title: string;
  metric: string;
  valueFormatter?: (value: number) => string;
  className?: string;
  selectedYears?: number[];
}

export function YearOverYearComparison({
  data,
  title,
  metric,
  valueFormatter = formatCurrency,
  className = '',
  selectedYears,
}: YearOverYearProps) {
  const chartTheme = useChartTheme();

  // Process data for comparison
  const processedData = useMemo(() => {
    if (!data.length) return [];

    // Group data by year
    const yearGroups = data.reduce((acc, item) => {
      if (!acc[item.year]) acc[item.year] = [];
      acc[item.year].push(item);
      return acc;
    }, {} as Record<number, ComparisonDataPoint[]>);

    // Get available years, filter by selectedYears if provided
    const years = Object.keys(yearGroups)
      .map(Number)
      .filter(year => !selectedYears || selectedYears.includes(year))
      .sort((a, b) => b - a) // Most recent first
      .slice(0, 3); // Show max 3 years for clarity

    // Create unified dataset for comparison
    const allPeriods = new Set<string>();
    years.forEach(year => {
      yearGroups[year].forEach(item => allPeriods.add(item.period));
    });

    return Array.from(allPeriods).sort().map(period => {
      const dataPoint: any = { period };
      years.forEach(year => {
        const yearData = yearGroups[year].find(item => item.period === period);
        dataPoint[`year_${year}`] = yearData?.value || null;
      });
      return dataPoint;
    });
  }, [data, selectedYears]);

  // Calculate year-over-year changes
  const yearlyStats = useMemo(() => {
    const years = Object.keys(data.reduce((acc, item) => {
      acc[item.year] = true;
      return acc;
    }, {} as Record<number, boolean>))
      .map(Number)
      .sort((a, b) => b - a)
      .slice(0, 3);

    return years.map(year => {
      const yearData = data.filter(item => item.year === year);
      if (yearData.length < 2) return null;

      const firstValue = yearData[0].value;
      const lastValue = yearData[yearData.length - 1].value;
      const change = lastValue - firstValue;
      const percentChange = firstValue !== 0 ? (change / firstValue) * 100 : 0;

      return {
        year,
        firstValue,
        lastValue,
        change,
        percentChange,
        dataPoints: yearData.length,
      };
    }).filter(Boolean);
  }, [data]);

  if (!processedData.length) {
    return (
      <Card className={className}>
        <div className="p-6 text-center text-surface-500">
          <p>No data available for year-over-year comparison</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {yearlyStats.filter(Boolean).map((stats) => stats && (
          <Card key={stats.year} className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-1">
                {stats.year}
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-surface-600 dark:text-surface-400">
                    Net Change
                  </div>
                  <div className={`font-semibold ${
                    stats.change >= 0 
                      ? 'text-red-500' // Debt increase = red
                      : 'text-green-500' // Debt decrease = green
                  }`}>
                    {stats.change >= 0 ? '+' : ''}
                    {valueFormatter(stats.change)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-surface-600 dark:text-surface-400">
                    Percent Change
                  </div>
                  <div className={`font-semibold ${
                    stats.percentChange >= 0 
                      ? 'text-red-500'
                      : 'text-green-500'
                  }`}>
                    {stats.percentChange >= 0 ? '+' : ''}
                    {formatPercent(stats.percentChange / 100)}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="h-96">
          <LazyLineChart
            data={processedData}
            xKey="period"
            lines={processedData.length > 0 
              ? Object.keys(processedData[0])
                  .filter(key => key.startsWith('year_'))
                  .map(key => ({
                    key,
                    name: key.replace('year_', ''),
                    color: CHART_COLORS[
                      Object.keys(processedData[0]).indexOf(key) % CHART_COLORS.length
                    ],
                  }))
              : []
            }
            yAxisFormatter={valueFormatter}
            tooltipFormatter={(value: number) => valueFormatter(value)}
          />
        </div>
        <div className="mt-4 text-sm text-surface-600 dark:text-surface-400">
          Comparing {metric} across the last {yearlyStats.length} years with available data.
        </div>
      </Card>
    </div>
  );
}