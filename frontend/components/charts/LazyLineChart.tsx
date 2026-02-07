'use client';

import { lazy, Suspense } from 'react';
import { ChartSkeleton } from '../ui/ChartSkeleton';

// Lazy load the LineChart component
const LineChartComponent = lazy(() => 
  import('recharts').then(module => ({ 
    default: ({ data, margin, children, ...props }: any) => (
      <module.ResponsiveContainer width="100%" height={300} {...props}>
        <module.LineChart data={data} margin={margin}>
          {children}
        </module.LineChart>
      </module.ResponsiveContainer>
    )
  }))
);

// Lazy load the Line element
export const LazyLine = lazy(() => 
  import('recharts').then(module => ({ default: module.Line }))
);

interface LazyLineChartProps {
  data: any[];
  height?: number;
  margin?: any;
  children?: React.ReactNode;
  [key: string]: any;
}

export function LazyLineChart({ data, height = 300, margin, children, ...props }: LazyLineChartProps) {
  return (
    <Suspense fallback={<ChartSkeleton height={height} />}>
      <div className="w-full">
        <LineChartComponent 
          data={data} 
          margin={margin} 
          height={height}
          {...props}
        >
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </LineChartComponent>
      </div>
    </Suspense>
  );
}