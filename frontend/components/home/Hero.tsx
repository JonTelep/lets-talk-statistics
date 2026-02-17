import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-24 pb-20">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-foreground mb-6">
          Government data,
          <br />
          <span className="text-surface-400">without the spin.</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-surface-500 mb-10">
          No opinions. No narratives. Just objective data from the Treasury, BLS, Census Bureau,
          and FEC. Explore the numbers and draw your own conclusions.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/debt" className="btn-primary">
            Start Exploring
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/about" className="btn-secondary">
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}
