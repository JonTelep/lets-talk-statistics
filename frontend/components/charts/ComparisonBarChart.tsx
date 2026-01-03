'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ComparisonBarChartProps {
  data: any[];
  xKey: string;
  bars: {
    key: string;
    name: string;
    color: string;
  }[];
  height?: number;
  title?: string;
  horizontal?: boolean;
}

export default function ComparisonBarChart({
  data,
  xKey,
  bars,
  height = 400,
  title,
  horizontal = false,
}: ComparisonBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          {horizontal ? (
            <>
              <XAxis type="number" stroke="#6b7280" style={{ fontSize: '0.875rem' }} />
              <YAxis dataKey={xKey} type="category" stroke="#6b7280" style={{ fontSize: '0.875rem' }} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} stroke="#6b7280" style={{ fontSize: '0.875rem' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '0.875rem' }} />
            </>
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
            }}
          />
          <Legend />
          {bars.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.name}
              fill={bar.color}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
