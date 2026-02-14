/**
 * Loading Skeleton Components
 * 
 * Provides shimmer-effect placeholders for various content types.
 * Used to improve perceived performance during data loading.
 */
'use client';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

// Base skeleton element with shimmer animation
export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
      style={style}
    />
  );
}

// Stat card skeleton (for the 4-stat row)
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-8 w-20 mb-1" />
      <Skeleton className="h-3 w-28" />
    </div>
  );
}

// Row of stat card skeletons
export function StatCardsRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Table skeleton with configurable rows and columns
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export function TableSkeleton({ rows = 5, columns = 4, showHeader = true }: TableSkeletonProps) {
  return (
    <div className="overflow-hidden">
      {showHeader && (
        <div className="bg-gray-50 px-6 py-3 flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
      )}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="px-6 py-4 flex gap-4 items-center">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Skeleton
                key={colIdx}
                className={`h-4 ${colIdx === 0 ? 'w-24' : 'flex-1'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Card skeleton (for sidebar cards)
export function CardSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="p-6 space-y-4">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// List skeleton (for politician lists, etc.)
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="divide-y divide-gray-200">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Hero counter skeleton (for debt page style live counters)
export function HeroCounterSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      <Skeleton className="h-4 w-32 mx-auto mb-4" />
      <Skeleton className="h-14 w-72 mx-auto mb-2" />
      <Skeleton className="h-4 w-40 mx-auto mb-4" />
      <div className="flex justify-center gap-8">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  );
}

// Full page section skeleton with table
export function PageSectionSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-20" />
      </div>
      <TableSkeleton rows={8} columns={4} showHeader={true} />
    </div>
  );
}

// Congress/trades specific skeleton
export function TradesTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left"><Skeleton className="h-3 w-20" /></th>
              <th className="px-6 py-3 text-left"><Skeleton className="h-3 w-16" /></th>
              <th className="px-6 py-3 text-left"><Skeleton className="h-3 w-12" /></th>
              <th className="px-6 py-3 text-right"><Skeleton className="h-3 w-16" /></th>
              <th className="px-6 py-3 text-right"><Skeleton className="h-3 w-16" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                <td className="px-6 py-4">
                  <Skeleton className="h-6 w-14 rounded-full" />
                </td>
                <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-24 ml-auto" /></td>
                <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Politician list skeleton (alias for count parameter)
export function PoliticianListSkeleton({ items = 10, count }: { items?: number; count?: number }) {
  const itemCount = count ?? items;
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <Skeleton className="h-5 w-36" />
      </div>
      <div className="divide-y divide-gray-200">
        {Array.from({ length: itemCount }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded" />
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="h-4 w-16 mb-1" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Filter bar skeleton
export function FilterBarSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24 ml-auto" />
      </div>
    </div>
  );
}

// Chart skeleton with animated elements to mimic chart loading
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="animate-pulse bg-white rounded-lg p-6" style={{ height }}>
      <div className="h-full flex flex-col">
        {/* Chart title area */}
        <div className="mb-4">
          <Skeleton className="h-4 w-48 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
        
        {/* Chart area */}
        <div className="flex-1 bg-gray-100 rounded-lg relative overflow-hidden">
          {/* Simulated chart bars/lines */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-t-sm animate-shimmer"
                style={{
                  height: `${Math.random() * 60 + 20}%`,
                  flex: 1,
                  maxWidth: '20px',
                }}
              />
            ))}
          </div>
          
          {/* Loading text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-400 text-sm">Loading chart...</div>
          </div>
        </div>
        
        {/* Legend area */}
        <div className="mt-4 flex gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-200 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-200 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Export all skeleton types
export const Skeletons = {
  Base: Skeleton,
  StatCard: StatCardSkeleton,
  StatCardsRow: StatCardsRowSkeleton,
  Table: TableSkeleton,
  Card: CardSkeleton,
  List: ListSkeleton,
  HeroCounter: HeroCounterSkeleton,
  PageSection: PageSectionSkeleton,
  TradesTable: TradesTableSkeleton,
  PoliticianList: PoliticianListSkeleton,
  FilterBar: FilterBarSkeleton,
  Chart: ChartSkeleton,
};
