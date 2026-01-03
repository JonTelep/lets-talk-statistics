'use client';

import { useState, useEffect } from 'react';
import Select from '../ui/Select';
import apiClient from '@/lib/api/client';

interface YearFilterProps {
  value: number | string;
  onChange: (year: number | string) => void;
  label?: string;
  includeAll?: boolean;
}

export default function YearFilter({
  value,
  onChange,
  label = 'Year',
  includeAll = false,
}: YearFilterProps) {
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchYears() {
      try {
        const response = await apiClient.get('/statistics/years');
        setYears(response.data.sort((a: number, b: number) => b - a)); // Sort descending
      } catch (error) {
        console.error('Error fetching years:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchYears();
  }, []);

  const options = [
    ...(includeAll ? [{ value: '', label: 'All Years' }] : []),
    ...years.map((year) => ({ value: year, label: year.toString() })),
  ];

  return (
    <Select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
      options={options}
      disabled={loading}
      fullWidth
    />
  );
}
