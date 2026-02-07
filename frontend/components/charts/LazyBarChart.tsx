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
export const LazyBar = lazy(() => 
  import('recharts').then(module => ({ default: module.Bar }))
);

export const LazyXAxis = lazy(() => 
  import('recharts').then(module => ({ default: module.XAxis }))
);

export const LazyYAxis = lazy(() => 
  import('recharts').then(module => ({ default: module.YAxis }))
);

export const LazyCartesianGrid = lazy(() => 
  import('recharts').then(module => ({ default: module.CartesianGrid }))
);

export const LazyTooltip = lazy(() => 
  import('recharts').then(module => ({ default: module.Tooltip }))
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