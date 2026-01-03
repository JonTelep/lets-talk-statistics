'use client';

import { useState, useEffect } from 'react';
import { Download, Info } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StateFilter from '@/components/filters/StateFilter';
import YearFilter from '@/components/filters/YearFilter';
import DataTable from '@/components/data/DataTable';
import apiClient from '@/lib/api/client';
import { CrimeStatistic, PerCapitaRate } from '@/lib/types/api';

export default function ExplorePage() {
  const [viewMode, setViewMode] = useState<'raw' | 'per-capita'>('per-capita');
  const [selectedState, setSelectedState] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | string>('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedState, selectedYear, viewMode]);

  async function fetchData() {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedState) params.state = selectedState;
      if (selectedYear) params.year = selectedYear;

      const endpoint = viewMode === 'per-capita' ? '/statistics/per-capita' : '/statistics/';
      const response = await apiClient.get(endpoint, { params });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    try {
      const params: any = {};
      if (selectedState) params.state = selectedState;
      if (selectedYear) params.year = selectedYear;

      const response = await apiClient.get('/csv/export', {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `crime_statistics_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  }

  const rawColumns = [
    { key: 'state', label: 'State', sortable: true },
    { key: 'year', label: 'Year', sortable: true },
    {
      key: 'population',
      label: 'Population',
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'violent_crime',
      label: 'Violent Crime',
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'murder',
      label: 'Murder',
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'rape',
      label: 'Rape',
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'robbery',
      label: 'Robbery',
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'aggravated_assault',
      label: 'Agg. Assault',
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'property_crime',
      label: 'Property Crime',
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
  ];

  const perCapitaColumns = [
    { key: 'state', label: 'State', sortable: true },
    { key: 'year', label: 'Year', sortable: true },
    {
      key: 'population',
      label: 'Population',
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'violent_crime_rate',
      label: 'Violent Crime Rate',
      sortable: true,
      render: (value: number) => value.toFixed(2),
    },
    {
      key: 'murder_rate',
      label: 'Murder Rate',
      sortable: true,
      render: (value: number) => value.toFixed(2),
    },
    {
      key: 'rape_rate',
      label: 'Rape Rate',
      sortable: true,
      render: (value: number) => value.toFixed(2),
    },
    {
      key: 'robbery_rate',
      label: 'Robbery Rate',
      sortable: true,
      render: (value: number) => value.toFixed(2),
    },
    {
      key: 'aggravated_assault_rate',
      label: 'Agg. Assault Rate',
      sortable: true,
      render: (value: number) => value.toFixed(2),
    },
    {
      key: 'property_crime_rate',
      label: 'Property Crime Rate',
      sortable: true,
      render: (value: number) => value.toFixed(2),
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Explore Crime Statistics
          </h1>
          <p className="text-lg text-gray-600">
            Browse and filter crime data from government sources
          </p>
        </div>

        {/* Info Banner */}
        <Card className="mb-6 bg-blue-50 border-l-4 border-primary-500">
          <div className="flex">
            <Info className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700">
                <strong>Per Capita rates</strong> are calculated per 100,000 people,
                allowing fair comparisons between states with different populations.
                Toggle between raw numbers and rates using the buttons below.
              </p>
            </div>
          </div>
        </Card>

        {/* Filters and Controls */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StateFilter
              value={selectedState}
              onChange={setSelectedState}
              includeAll={true}
            />
            <YearFilter
              value={selectedYear}
              onChange={setSelectedYear}
              includeAll={true}
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
                  variant={viewMode === 'per-capita' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('per-capita')}
                  className="flex-1"
                >
                  Per Capita
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {data.length} result{data.length !== 1 ? 's' : ''}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={data.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </Card>

        {/* Data Table */}
        <Card padding="none">
          <DataTable
            data={data}
            columns={viewMode === 'per-capita' ? perCapitaColumns : rawColumns}
            loading={loading}
            emptyMessage="No data found for the selected filters"
          />
        </Card>

        {/* Data Source Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Data sourced from FBI Crime Data Explorer and US Census Bureau
        </div>
      </div>
    </div>
  );
}
