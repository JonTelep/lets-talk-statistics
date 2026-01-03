'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Calendar, MapPin } from 'lucide-react';

interface SummaryStats {
  total_crimes: number;
  total_population: number;
  average_crime_rate: number;
  year_range: {
    min: number;
    max: number;
  };
  state_count: number;
}

export default function QuickStats() {
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/v1/analytics/summary');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching summary stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-8"></div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-100 rounded-lg p-6 h-32"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      label: 'Data Years',
      value: `${stats.year_range.min} - ${stats.year_range.max}`,
      icon: <Calendar className="h-8 w-8 text-primary-500" />,
      color: 'bg-primary-50',
    },
    {
      label: 'States Tracked',
      value: stats.state_count.toString(),
      icon: <MapPin className="h-8 w-8 text-success" />,
      color: 'bg-green-50',
    },
    {
      label: 'Total Crimes Recorded',
      value: stats.total_crimes.toLocaleString(),
      icon: <TrendingUp className="h-8 w-8 text-warning" />,
      color: 'bg-amber-50',
    },
    {
      label: 'Avg Crime Rate',
      value: `${stats.average_crime_rate.toFixed(1)} per 100k`,
      icon: <TrendingDown className="h-8 w-8 text-primary-600" />,
      color: 'bg-blue-50',
    },
  ];

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Quick Overview
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Key statistics from our comprehensive database
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className={`${stat.color} rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-3">
                {stat.icon}
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            All data sourced from the FBI Crime Data Explorer, Bureau of Justice Statistics,
            and US Census Bureau
          </p>
        </div>
      </div>
    </section>
  );
}
