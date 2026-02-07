'use client';

import { lazy, Suspense, ComponentType } from 'react';
import { ChartSkeleton } from '../ui/ChartSkeleton';

// Lazy load the PieChart component
const PieChartComponent = lazy(() => 
  import('recharts').then(module => ({ 
    default: ({ children, ...props }: any) => (
      <module.ResponsiveContainer width="100%" height={300} {...props}>
        <module.PieChart>
          {children}
        </module.PieChart>
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
export const LazyPie = createLazyComponent(() => 
  import('recharts').then(module => ({ default: module.Pie }))
);

export const LazyCell = createLazyComponent(() => 
  import('recharts').then(module => ({ default: module.Cell }))
);

export const LazyLegend = createLazyComponent(() => 
  import('recharts').then(module => ({ default: module.Legend }))
);

interface LazyPieChartProps {
  height?: number;
  children?: React.ReactNode;
  [key: string]: any;
}

export function LazyPieChart({ height = 300, children, ...props }: LazyPieChartProps) {
  return (
    <Suspense fallback={<ChartSkeleton height={height} />}>
      <div className="w-full">
        <PieChartComponent height={height} {...props}>
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </PieChartComponent>
      </div>
    </Suspense>
  );
}
