'use client';

import { lazy, Suspense } from 'react';
import { ChartSkeleton } from '../ui/ChartSkeleton';

// Lazy load the BarChart component
const BarChartComponent = lazy(() => 
  import('recharts').then(module => ({ 
    default: ({ data, margin, children, ...props }: any) => (
      <module.ResponsiveContainer width="100%" height={300} {...props}>
        <module.BarChart data={data} margin={margin}>
          {children}
        </module.BarChart>
      </module.ResponsiveContainer>
    )
  }))
);

// Lazy load individual chart elements
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LazyBar: any = lazy(() =>
  import('recharts').then(module => ({ default: module.Bar as any }))
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LazyXAxis: any = lazy(() =>
  import('recharts').then(module => ({ default: module.XAxis as any }))
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LazyYAxis: any = lazy(() =>
  import('recharts').then(module => ({ default: module.YAxis as any }))
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LazyCartesianGrid: any = lazy(() =>
  import('recharts').then(module => ({ default: module.CartesianGrid as any }))
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LazyTooltip: any = lazy(() =>
  import('recharts').then(module => ({ default: module.Tooltip as any }))
);

interface LazyBarChartProps {
  data: any[];
  height?: number;
  margin?: any;
  children?: React.ReactNode;
  [key: string]: any;
}

export function LazyBarChart({ data, height = 300, margin, children, ...props }: LazyBarChartProps) {
  return (
    <Suspense fallback={<ChartSkeleton height={height} />}>
      <div className="w-full">
        <BarChartComponent 
          data={data} 
          margin={margin} 
          height={height}
          {...props}
        >
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </BarChartComponent>
      </div>
    </Suspense>
  );
}