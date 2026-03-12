/**
 * Chart Skeleton Component — Dark theme
 */
'use client';

import { Skeleton } from './Skeleton';

interface ChartSkeletonProps {
  height?: number;
  className?: string;
}

export function ChartSkeleton({ height = 300, className = '' }: ChartSkeletonProps) {
  return (
    <div 
      className={`card p-6 ${className}`}
      style={{ height: `${height}px` }}
    >
      <div className="mb-4">
        <Skeleton className="h-5 w-48 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div 
        className="relative bg-surface-800 rounded-lg"
        style={{ height: `${Math.max(200, height - 100)}px` }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-surface-600 text-sm">Loading chart...</div>
        </div>
      </div>
    </div>
  );
}
