'use client';

import { lazy, Suspense, ComponentType } from 'react';
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

// Type helper for lazy loaded recharts components
const createLazyComponent = <T,>(
  loader: () => Promise<{ default: T }>
): ComponentType<any> => {
  return lazy(loader as any) as unknown as ComponentType<any>;
};

// Lazy load individual chart elements
export const LazyBar = createLazyComponent(() => 
  import('recharts').then(module => ({ default: module.Bar }))
);

export const LazyXAxis = createLazyComponent(() => 
  import('recharts').then(module => ({ default: module.XAxis }))
);

export const LazyYAxis = createLazyComponent(() => 
  import('recharts').then(module => ({ default: module.YAxis }))
);

export const LazyCartesianGrid = createLazyComponent(() => 
  import('recharts').then(module => ({ default: module.CartesianGrid }))
);

export const LazyTooltip = createLazyComponent(() => 
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
