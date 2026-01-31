'use client';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-8 w-32" />
    </div>
  );
}

export function StatCardsRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TradesTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="p-4 space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b border-gray-100">
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-16 h-4" />
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-20 h-4" />
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          <div className="w-32 flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="w-20 h-4" />
          </div>
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-16 h-6 rounded-full" />
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-20 h-4" />
        </div>
      ))}
    </div>
  );
}

export function PoliticianListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="divide-y divide-gray-200">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-6 h-6" />
            <Skeleton className="w-5 h-5 rounded-full" />
            <div>
              <Skeleton className="w-32 h-4 mb-1" />
              <Skeleton className="w-16 h-3" />
            </div>
          </div>
          <Skeleton className="w-12 h-4" />
        </div>
      ))}
    </div>
  );
}

export function HeroCounterSkeleton() {
  return (
    <div className="text-center">
      <Skeleton className="h-16 w-48 mx-auto mb-2" />
      <Skeleton className="h-4 w-32 mx-auto" />
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex justify-between">
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-16 h-4" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <Skeleton className="h-6 w-40 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
