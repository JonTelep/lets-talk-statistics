'use client';

import { useState, useEffect } from 'react';
import Select from '../ui/Select';
import apiClient from '@/lib/api/client';

interface StateFilterProps {
  value: string;
  onChange: (state: string) => void;
  label?: string;
  includeAll?: boolean;
}

export default function StateFilter({
  value,
  onChange,
  label = 'State',
  includeAll = true,
}: StateFilterProps) {
  const [states, setStates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStates() {
      try {
        const response = await apiClient.get('/statistics/states');
        setStates(response.data);
      } catch (error) {
        console.error('Error fetching states:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStates();
  }, []);

  const options = [
    ...(includeAll ? [{ value: '', label: 'All States' }] : []),
    ...states.map((state) => ({ value: state, label: state })),
  ];

  return (
    <Select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={options}
      disabled={loading}
      fullWidth
    />
  );
}
