'use client';

import { lazy, Suspense } from 'react';
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

// Lazy load individual chart elements
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LazyPie: any = lazy(() =>
  import('recharts').then(module => ({ default: module.Pie as any }))
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LazyCell: any = lazy(() =>
  import('recharts').then(module => ({ default: module.Cell as any }))
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LazyLegend: any = lazy(() =>
  import('recharts').then(module => ({ default: module.Legend as any }))
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