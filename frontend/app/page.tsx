import Hero from '@/components/home/Hero';
import DefinitionCard from '@/components/home/DefinitionCard';
import QuickStats from '@/components/home/QuickStats';
import { BarChart3, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <Hero />

      {/* Definition Cards - Front and Center */}
      <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-12">
            Understanding the Terms
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
            <DefinitionCard
              icon={<BarChart3 className="h-12 w-12 text-primary-500" />}
              term="Statistics"
              definition="A collection of quantitative data gathered and analyzed to show patterns and trends."
              context="In this project: Counts of reported incidents documented by government agencies like the FBI and Bureau of Justice Statistics."
              importance="Understanding the raw numbers helps us see the scale of issues and identify where resources may be needed."
            />

            <DefinitionCard
              icon={<Users className="h-12 w-12 text-primary-500" />}
              term="Per Capita"
              definition="A rate per 100,000 people. This normalizes data across different population sizes, enabling fair comparisons."
              context="Formula: (incidents ÷ population) × 100,000"
              importance="California may have more total incidents than Wyoming, but per capita rates reveal which state has a higher rate relative to its population. This is crucial for fair comparisons."
              example="If State A has 1,000 incidents and 10 million people, its per capita rate is 10 per 100,000. State B with 100 incidents and 100,000 people also has a rate of 100 per 100,000 — ten times higher despite fewer total incidents."
            />
          </div>
        </div>
      </section>

      {/* Quick Stats Overview */}
      <QuickStats />

      {/* Call to Action */}
      <section className="bg-primary-500 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
            Ready to Explore the Data?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Dive into the statistics, compare states, analyze trends, and draw your own conclusions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/explore"
              className="inline-flex items-center justify-center rounded-md bg-white px-8 py-3 text-base font-medium text-primary-600 shadow-sm hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-500"
            >
              Explore Data
            </a>
            <a
              href="/trends"
              className="inline-flex items-center justify-center rounded-md border-2 border-white px-8 py-3 text-base font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-500"
            >
              View Trends
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
