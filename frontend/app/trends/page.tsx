'use client';

import { useState, useEffect } from 'react';
import { Info, TrendingUp, TrendingDown } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StateFilter from '@/components/filters/StateFilter';
import CrimeTypeFilter from '@/components/filters/CrimeTypeFilter';
import TrendLineChart from '@/components/charts/TrendLineChart';
import { useTrends } from '@/lib/hooks/useTrends';
import { CrimeType, CRIME_TYPES, CRIME_TYPE_LABELS } from '@/lib/types/api';

export default function TrendsPage() {
  const [selectedState, setSelectedState] = useState('');
  const [selectedCrimeType, setSelectedCrimeType] = useState<CrimeType>(CRIME_TYPES.VIOLENT_CRIME);
  const [viewMode, setViewMode] = useState<'rate' | 'raw'>('rate');

  const { data: trendData, loading } = useTrends({
    state: selectedState || undefined,
  });

  // Calculate summary statistics
  const calculateTrendSummary = () => {
    if (!trendData || trendData.length < 2) return null;

    const rateKey = `${selectedCrimeType}_rate` as keyof typeof trendData[0];
    const rawKey = selectedCrimeType as keyof typeof trendData[0];
    const key = viewMode === 'rate' ? rateKey : rawKey;

    const sortedData = [...trendData].sort((a, b) => a.year - b.year);
    const firstValue = sortedData[0][key] as number;
    const lastValue = sortedData[sortedData.length - 1][key] as number;
    const change = lastValue - firstValue;
    const percentChange = ((change / firstValue) * 100);

    return {
      firstYear: sortedData[0].year,
      lastYear: sortedData[sortedData.length - 1].year,
      firstValue,
      lastValue,
      change,
      percentChange,
      isIncrease: change > 0,
    };
  };

  const summary = calculateTrendSummary();

  // Format data for charts
  const getChartData = () => {
    if (!trendData) return [];

    const rateKey = `${selectedCrimeType}_rate` as keyof typeof trendData[0];
    const rawKey = selectedCrimeType as keyof typeof trendData[0];

    return trendData.map((item) => ({
      year: item.year,
      [CRIME_TYPE_LABELS[selectedCrimeType]]:
        viewMode === 'rate'
          ? (item[rateKey] as number)
          : (item[rawKey] as number),
    }));
  };

  // Get multiple crime types for comparison
  const getMultiCrimeChartData = () => {
    if (!trendData) return [];

    return trendData.map((item) => ({
      year: item.year,
      'Violent Crime': viewMode === 'rate' ? item.violent_crime_rate : item.violent_crime,
      'Property Crime': viewMode === 'rate' ? item.property_crime_rate : item.property_crime,
      Murder: viewMode === 'rate' ? item.murder_rate : item.murder,
      Robbery: viewMode === 'rate' ? item.robbery_rate : item.robbery,
    }));
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crime Trends Over Time
          </h1>
          <p className="text-lg text-gray-600">
            Analyze how crime rates have changed across years
          </p>
        </div>

        {/* Info Banner */}
        <Card className="mb-6 bg-blue-50 border-l-4 border-primary-500">
          <div className="flex">
            <Info className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700">
                Trends show year-over-year changes in crime statistics. Per capita rates are
                recommended for analyzing trends, as they account for population changes over time.
              </p>
            </div>
          </div>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StateFilter
              value={selectedState}
              onChange={setSelectedState}
              includeAll={true}
              label="State (All for National Average)"
            />
            <CrimeTypeFilter
              value={selectedCrimeType}
              onChange={setSelectedCrimeType}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                View Mode
              </label>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'raw' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('raw')}
                  className="flex-1"
                >
                  Raw Numbers
                </Button>
                <Button
                  variant={viewMode === 'rate' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('rate')}
                  className="flex-1"
                >
                  Per Capita
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Overall Change</p>
                  <p className={`text-2xl font-bold ${summary.isIncrease ? 'text-red-600' : 'text-green-600'}`}>
                    {summary.isIncrease ? '+' : ''}{summary.percentChange.toFixed(2)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {summary.firstYear} to {summary.lastYear}
                  </p>
                </div>
                {summary.isIncrease ? (
                  <TrendingUp className="h-12 w-12 text-red-600" />
                ) : (
                  <TrendingDown className="h-12 w-12 text-green-600" />
                )}
              </div>
            </Card>

            <Card>
              <p className="text-sm text-gray-500 mb-1">{summary.firstYear}</p>
              <p className="text-2xl font-bold text-gray-900">
                {viewMode === 'rate'
                  ? summary.firstValue.toFixed(2)
                  : summary.firstValue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {viewMode === 'rate' ? 'per 100,000' : 'total incidents'}
              </p>
            </Card>

            <Card>
              <p className="text-sm text-gray-500 mb-1">{summary.lastYear}</p>
              <p className="text-2xl font-bold text-gray-900">
                {viewMode === 'rate'
                  ? summary.lastValue.toFixed(2)
                  : summary.lastValue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {viewMode === 'rate' ? 'per 100,000' : 'total incidents'}
              </p>
            </Card>
          </div>
        )}

        {/* Main Trend Chart */}
        <Card className="mb-6">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-pulse text-gray-500">Loading trend data...</div>
            </div>
          ) : (
            <TrendLineChart
              data={getChartData()}
              xKey="year"
              lines={[
                {
                  key: CRIME_TYPE_LABELS[selectedCrimeType],
                  name: CRIME_TYPE_LABELS[selectedCrimeType],
                  color: '#0ea5e9',
                },
              ]}
              title={`${CRIME_TYPE_LABELS[selectedCrimeType]} Trend${selectedState ? ` - ${selectedState}` : ' - National'}`}
              height={400}
            />
          )}
        </Card>

        {/* Multi-Crime Comparison */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-pulse text-gray-500">Loading comparison data...</div>
            </div>
          ) : (
            <TrendLineChart
              data={getMultiCrimeChartData()}
              xKey="year"
              lines={[
                { key: 'Violent Crime', name: 'Violent Crime', color: '#ef4444' },
                { key: 'Property Crime', name: 'Property Crime', color: '#f59e0b' },
                { key: 'Murder', name: 'Murder', color: '#dc2626' },
                { key: 'Robbery', name: 'Robbery', color: '#fb923c' },
              ]}
              title={`Crime Type Comparison${selectedState ? ` - ${selectedState}` : ' - National'}`}
              height={400}
            />
          )}
        </Card>

        {/* Data Source Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Data sourced from FBI Crime Data Explorer and US Census Bureau
        </div>
      </div>
    </div>
  );
}
