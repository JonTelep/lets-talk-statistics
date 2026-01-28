'use client';

import { useState } from 'react';
import { Info, ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StateFilter from '@/components/filters/StateFilter';
import YearFilter from '@/components/filters/YearFilter';
import ComparisonBarChart from '@/components/charts/ComparisonBarChart';
import apiClient from '@/lib/api/client';
import { ComparisonResponse, ComparisonItem } from '@/lib/types/api';

export default function ComparePage() {
  const [comparisonType, setComparisonType] = useState<'states' | 'years'>('states');

  // State comparison inputs
  const [state1, setState1] = useState('');
  const [state2, setState2] = useState('');
  const [yearForStates, setYearForStates] = useState<number | string>('');

  // Year comparison inputs
  const [stateForYears, setStateForYears] = useState('');
  const [year1, setYear1] = useState<number | string>('');
  const [year2, setYear2] = useState<number | string>('');

  const [comparisonData, setComparisonData] = useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCompare() {
    if (comparisonType === 'states' && (!state1 || !state2 || !yearForStates)) {
      alert('Please select both states and a year');
      return;
    }

    if (comparisonType === 'years' && (!stateForYears || !year1 || !year2)) {
      alert('Please select a state and both years');
      return;
    }

    setLoading(true);
    try {
      if (comparisonType === 'states') {
        const response = await apiClient.get<ComparisonResponse>('/comparisons/states', {
          params: {
            states: `${state1},${state2}`,
            year: yearForStates,
            crime_type: 'violent_crime'
          },
        });
        setComparisonData(response.data);
      } else {
        const response = await apiClient.get<ComparisonResponse>('/comparisons/years', {
          params: {
            state: stateForYears,
            years: `${year1},${year2}`,
            crime_type: 'violent_crime'
          },
        });
        setComparisonData(response.data);
      }
    } catch (error) {
      console.error('Error fetching comparison:', error);
      alert('Error fetching comparison data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function formatStateComparisonChart(data: ComparisonResponse) {
    if (data.items.length < 2) return [];
    const item1 = data.items[0];
    const item2 = data.items[1];
    return [
      {
        category: data.crime_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        [item1.label]: item1.per_capita_rate || 0,
        [item2.label]: item2.per_capita_rate || 0,
      },
    ];
  }

  function formatYearComparisonChart(data: ComparisonResponse) {
    if (data.items.length < 2) return [];
    const item1 = data.items[0];
    const item2 = data.items[1];
    const rate1 = item1.per_capita_rate || 0;
    const rate2 = item2.per_capita_rate || 0;
    const pctChange = rate1 !== 0 ? ((rate2 - rate1) / rate1) * 100 : 0;
    return [
      {
        category: data.crime_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        change: pctChange,
      },
    ];
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Compare Statistics
          </h1>
          <p className="text-lg text-gray-600">
            Side-by-side comparison of states or time periods
          </p>
        </div>

        {/* Info Banner */}
        <Card className="mb-6 bg-blue-50 border-l-4 border-primary-500">
          <div className="flex">
            <Info className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700">
                Compare two states in the same year, or compare how a single state has changed
                between two different years. All comparisons use per capita rates for fair analysis.
              </p>
            </div>
          </div>
        </Card>

        {/* Comparison Type Toggle */}
        <Card className="mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comparison Type
            </label>
            <div className="flex gap-2">
              <Button
                variant={comparisonType === 'states' ? 'primary' : 'outline'}
                onClick={() => setComparisonType('states')}
                className="flex-1"
              >
                Compare States
              </Button>
              <Button
                variant={comparisonType === 'years' ? 'primary' : 'outline'}
                onClick={() => setComparisonType('years')}
                className="flex-1"
              >
                Compare Years
              </Button>
            </div>
          </div>

          {comparisonType === 'states' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StateFilter
                value={state1}
                onChange={setState1}
                label="State 1"
                includeAll={false}
              />
              <StateFilter
                value={state2}
                onChange={setState2}
                label="State 2"
                includeAll={false}
              />
              <YearFilter
                value={yearForStates}
                onChange={setYearForStates}
                label="Year"
                includeAll={false}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StateFilter
                value={stateForYears}
                onChange={setStateForYears}
                label="State"
                includeAll={false}
              />
              <YearFilter
                value={year1}
                onChange={setYear1}
                label="Year 1"
                includeAll={false}
              />
              <YearFilter
                value={year2}
                onChange={setYear2}
                label="Year 2"
                includeAll={false}
              />
            </div>
          )}

          <div className="mt-4">
            <Button onClick={handleCompare} fullWidth disabled={loading}>
              {loading ? 'Loading...' : 'Compare'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Comparison Results */}
        {comparisonData && comparisonData.items.length >= 2 && (
          <div className="space-y-6">
            {comparisonType === 'states' ? (
              <>
                <Card>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {comparisonData.items[0].label} vs {comparisonData.items[1].label} ({comparisonData.items[0].year})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-primary-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">{comparisonData.items[0].label}</h3>
                      <p className="text-sm text-gray-600">Population: {comparisonData.items[0].population?.toLocaleString() || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Incidents: {comparisonData.items[0].incident_count?.toLocaleString() || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Rate: {comparisonData.items[0].per_capita_rate?.toFixed(2) || 'N/A'} per 100k</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">{comparisonData.items[1].label}</h3>
                      <p className="text-sm text-gray-600">Population: {comparisonData.items[1].population?.toLocaleString() || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Incidents: {comparisonData.items[1].incident_count?.toLocaleString() || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Rate: {comparisonData.items[1].per_capita_rate?.toFixed(2) || 'N/A'} per 100k</p>
                    </div>
                  </div>

                  <ComparisonBarChart
                    data={formatStateComparisonChart(comparisonData)}
                    xKey="category"
                    bars={[
                      { key: comparisonData.items[0].label, name: comparisonData.items[0].label, color: '#0ea5e9' },
                      { key: comparisonData.items[1].label, name: comparisonData.items[1].label, color: '#3b82f6' },
                    ]}
                    title={`${comparisonData.crime_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Rate per 100,000 People`}
                    height={400}
                  />
                </Card>
              </>
            ) : (
              <>
                <Card>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {comparisonData.items[0].state || 'All States'}: {comparisonData.items[0].label} vs {comparisonData.items[1].label}
                  </h2>

                  <ComparisonBarChart
                    data={formatYearComparisonChart(comparisonData)}
                    xKey="category"
                    bars={[
                      {
                        key: 'change',
                        name: 'Percent Change',
                        color: '#0ea5e9'
                      },
                    ]}
                    title="Percentage Change in Crime Rate"
                    height={400}
                  />

                  <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">{comparisonData.items[0].label}</p>
                      <p className="text-lg font-bold text-gray-900">
                        {comparisonData.items[0].per_capita_rate?.toFixed(2) || 'N/A'} per 100k
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">{comparisonData.items[1].label}</p>
                      <p className="text-lg font-bold text-gray-900">
                        {comparisonData.items[1].per_capita_rate?.toFixed(2) || 'N/A'} per 100k
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Change</p>
                      {(() => {
                        const rate1 = comparisonData.items[0].per_capita_rate || 0;
                        const rate2 = comparisonData.items[1].per_capita_rate || 0;
                        const pctChange = rate1 !== 0 ? ((rate2 - rate1) / rate1) * 100 : 0;
                        return (
                          <p className={`text-lg font-bold ${pctChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {pctChange > 0 ? '+' : ''}{pctChange.toFixed(2)}%
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Data Source Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Data sourced from FBI Crime Data Explorer and US Census Bureau
        </div>
      </div>
    </div>
  );
}
