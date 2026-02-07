'use client';

import { lazy, ComponentType } from 'react';

// Re-export all lazy chart components for easy importing
export { LazyBarChart, LazyBar, LazyXAxis, LazyYAxis, LazyCartesianGrid, LazyTooltip } from './LazyBarChart';
export { LazyLineChart, LazyLine } from './LazyLineChart'; 
export { LazyPieChart, LazyPie, LazyCell, LazyLegend } from './LazyPieChart';

// Type helper for lazy loaded recharts components
const createLazyComponent = <T,>(
  loader: () => Promise<{ default: T }>
): ComponentType<any> => {
  return lazy(loader as any) as unknown as ComponentType<any>;
};

// Also re-export ResponsiveContainer as a lazy component since it's commonly used
export const LazyResponsiveContainer = createLazyComponent(() => 
  import('recharts').then(module => ({ default: module.ResponsiveContainer }))
);
