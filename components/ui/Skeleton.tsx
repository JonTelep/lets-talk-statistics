/**
 * Loading Skeleton Components — Dark theme
 */
'use client';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer rounded ${className}`}
      style={style}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-8 w-20 mb-1" />
      <Skeleton className="h-3 w-28" />
    </div>
  );
}

export function StatCardsRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export function TableSkeleton({ rows = 5, columns = 4, showHeader = true }: TableSkeletonProps) {
  return (
    <div className="overflow-hidden">
      {showHeader && (
        <div className="bg-surface-900 px-6 py-3 flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
      )}
      <div className="divide-y divide-border">
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

export function CardSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-border">
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

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-border">
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="divide-y divide-border">
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

export function HeroCounterSkeleton() {
  return (
    <div className="card p-8 text-center">
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

export function PageSectionSkeleton() {
  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-border flex justify-between items-center">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-20" />
      </div>
      <TableSkeleton rows={8} columns={4} showHeader={true} />
    </div>
  );
}

export function TradesTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-900">
            <tr>
              <th className="px-6 py-3 text-left"><Skeleton className="h-3 w-20" /></th>
              <th className="px-6 py-3 text-left"><Skeleton className="h-3 w-16" /></th>
              <th className="px-6 py-3 text-left"><Skeleton className="h-3 w-12" /></th>
              <th className="px-6 py-3 text-right"><Skeleton className="h-3 w-16" /></th>
              <th className="px-6 py-3 text-right"><Skeleton className="h-3 w-16" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                <td className="px-6 py-4"><Skeleton className="h-6 w-14 rounded-full" /></td>
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

export function PoliticianListSkeleton({ items = 10, count }: { items?: number; count?: number }) {
  const itemCount = count ?? items;
  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <Skeleton className="h-5 w-36" />
      </div>
      <div className="divide-y divide-border">
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

export function FilterBarSkeleton() {
  return (
    <div className="card p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24 ml-auto" />
      </div>
    </div>
  );
}

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="animate-pulse card p-6" style={{ height }}>
      <div className="h-full flex flex-col">
        <div className="mb-4">
          <Skeleton className="h-4 w-48 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="flex-1 bg-surface-800 rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-surface-600 text-sm">Loading chart...</div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
