import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-primary-500 to-primary-700 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            <span className="block">LET'S TALK</span>
            <span className="block mt-2">STATISTICS</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-primary-100">
            Understanding Government Data Through Official Sources
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-primary-200">
            No opinions. No narratives. Just objective data from the Treasury, BLS, Census Bureau,
            and FEC. Explore the numbers and draw your own conclusions.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/debt"
              className="inline-flex items-center rounded-md bg-white px-6 py-3 text-base font-medium text-primary-600 shadow-sm hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-500 transition-colors"
            >
              Start Exploring
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center rounded-md border-2 border-white px-6 py-3 text-base font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-500 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    </div>
  );
}
