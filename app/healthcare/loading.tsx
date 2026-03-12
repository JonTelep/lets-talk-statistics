import { StatCardsRowSkeleton, ChartSkeleton, TableSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      <div className="space-y-2">
        <div className="h-10 w-48 bg-surface-800 rounded animate-shimmer" />
        <div className="h-4 w-80 bg-surface-800 rounded animate-shimmer" />
      </div>
      <StatCardsRowSkeleton count={3} />
      <ChartSkeleton height={400} />
      <TableSkeleton rows={8} columns={4} />
    </div>
  );
}
