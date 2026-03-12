import { HeroCounterSkeleton, ChartSkeleton, StatCardsRowSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      <HeroCounterSkeleton />
      <StatCardsRowSkeleton count={3} />
      <ChartSkeleton height={400} />
    </div>
  );
}
