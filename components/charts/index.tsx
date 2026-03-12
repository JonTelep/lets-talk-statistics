'use client';

// Re-export all lazy chart components for easy importing
export { LazyBarChart, LazyBar, LazyXAxis, LazyYAxis, LazyCartesianGrid, LazyTooltip } from './LazyBarChart';
export { LazyLineChart, LazyLine } from './LazyLineChart'; 
export { LazyPieChart, LazyPie, LazyCell, LazyLegend } from './LazyPieChart';

// Also re-export ResponsiveContainer as a lazy component since it's commonly used
import { lazy, Suspense } from 'react';

export const LazyResponsiveContainer = lazy(() => 
  import('recharts').then(module => ({ default: module.ResponsiveContainer }))
);