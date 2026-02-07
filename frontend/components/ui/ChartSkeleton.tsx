/**
 * Chart Skeleton Component
 * 
 * Loading placeholder for chart components with responsive sizing.
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
      className={`bg-white rounded-xl shadow-sm p-6 ${className}`}
      style={{ height: `${height}px` }}
    >
      {/* Chart title area */}
      <div className="mb-4">
        <Skeleton className="h-5 w-48 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
      
      {/* Chart area - responsive height */}
      <div 
        className="relative bg-gray-50 rounded-lg"
        style={{ height: `${Math.max(200, height - 100)}px` }}
      >
        {/* Simulated chart bars/lines */}
        <div className="absolute inset-4 flex items-end justify-between">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-6 bg-gray-200"
              style={{
                height: `${20 + Math.random() * 60}%`,
                marginLeft: i > 0 ? '4px' : '0'
              }}
            />
          ))}
        </div>
        
        {/* Y-axis labels simulation */}
        <div className="absolute left-1 top-4 bottom-4 flex flex-col justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-8" />
          ))}
        </div>
        
        {/* X-axis labels simulation */}
        <div className="absolute bottom-1 left-4 right-4 flex justify-between">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-8" />
          ))}
        </div>
      </div>
      
      {/* Legend area */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}