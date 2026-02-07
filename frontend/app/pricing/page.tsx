'use client';

import Link from 'next/link';
import { Check, X, Crown, Zap, Building, Shield, BarChart3, Download, Database, Bell, ArrowRight } from 'lucide-react';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for casual researchers and citizens',
    icon: BarChart3,
    color: 'federal-charcoal',
    features: [
      { text: 'All 6 data categories', included: true },
      { text: 'Last 6 months of data', included: true },
      { text: 'Basic charts & visualizations', included: true },
      { text: 'JSON data downloads', included: true },
      { text: 'Full historical data', included: false },
      { text: 'CSV/Excel exports', included: false },
      { text: 'PDF reports', included: false },
      { text: 'API access', included: false },
      { text: 'Custom dashboards', included: false },
      { text: 'Email alerts', included: false },
    ],
    cta: 'Current Plan',
    ctaHref: '/',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$14',
    period: '/month',
    description: 'For analysts, researchers, and power users',
    icon: Crown,
    color: 'federal-gold',
    features: [
      { text: 'All 6 data categories', included: true },
      { text: 'Full historical data (10+ years)', included: true },
      { text: 'Advanced charts & comparisons', included: true },
      { text: 'JSON data downloads', included: true },
      { text: 'CSV/Excel exports', included: true },
      { text: 'PDF reports with branding', included: true },
      { text: 'API access (1,000 calls/day)', included: true },
      { text: 'Custom dashboards (up to 5)', included: true },
      { text: 'Email alerts for key indicators', included: true },
      { text: 'Priority support', included: true },
    ],
    cta: 'Get Started',
    ctaHref: '/signup?plan=pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$49',
    period: '/month',
    description: 'For organizations and business intelligence teams',
    icon: Building,
    color: 'federal-navy',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Unlimited API access', included: true },
      { text: 'White-label reports', included: true },
      { text: 'Custom data integrations', included: true },
      { text: 'Team accounts (up to 10)', included: true },
      { text: 'Bulk data exports', included: true },
      { text: 'Custom dashboards (unlimited)', included: true },
      { text: 'Slack/Teams integration', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'SLA guarantee', included: true },
    ],
    cta: 'Contact Sales',
    ctaHref: 'mailto:enterprise@telep.io?subject=Enterprise%20Inquiry',
    popular: false,
  },
];

const useCases = [
  {
    title: 'Financial Analysts',
    description: 'Track congressional trading patterns to inform investment decisions.',
    icon: BarChart3,
  },
  {
    title: 'Policy Researchers',
    description: 'Access historical data for comprehensive policy analysis.',
    icon: Database,
  },
  {
    title: 'Business Intelligence',
    description: 'Export data to your existing BI tools and dashboards.',
    icon: Download,
  },
  {
    title: 'Academic Institutions',
    description: 'Bulk data access for research papers and studies.',
    icon: Building,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <section className="bg-federal-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 border-4 border-federal-gold-400 transform rotate-12"></div>
          <div className="absolute bottom-0 left-0 w-96 h-32 border-4 border-white transform -skew-x-12"></div>
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-federal-gold-500 text-federal-navy-900 px-4 py-2 text-sm font-bold uppercase tracking-wider mb-6 shadow-brutal-gold">
              <Crown className="h-4 w-4" />
              Pricing Plans
            </div>
            
            <h1 className="heading-display text-white mb-6">
              UNLOCK
              <br />
              <span className="text-federal-gold-400">FULL ACCESS</span>
            </h1>
            
            <p className="text-xl text-federal-navy-100 max-w-2xl mx-auto">
              Choose the plan that fits your needs. From free access for citizens 
              to enterprise solutions for organizations.
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-100 transform skew-y-1 origin-bottom-left"></div>
      </section>

      {/* Pricing Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-0">
            {tiers.map((tier, index) => {
              const Icon = tier.icon;
              const isPopular = tier.popular;
              
              return (
                <div
                  key={tier.name}
                  className={`relative bg-white border-2 p-8 ${
                    isPopular 
                      ? 'border-federal-gold-500 shadow-brutal-gold md:-translate-y-4 z-10' 
                      : 'border-federal-charcoal-200 shadow-brutal'
                  } ${index === 0 ? 'md:border-r-0' : ''} ${index === 2 ? 'md:border-l-0' : ''}`}
                >
                  {/* Popular badge */}
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 bg-federal-gold-500 text-federal-navy-900 px-4 py-1 text-xs font-bold uppercase tracking-wider shadow-brutal-gold">
                        <Zap className="h-3 w-3" />
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 mb-4 ${
                      isPopular ? 'bg-federal-gold-500' : 'bg-federal-navy-900'
                    }`}>
                      <Icon className={`h-8 w-8 ${isPopular ? 'text-federal-navy-900' : 'text-white'}`} />
                    </div>
                    
                    <h3 className="text-2xl font-serif font-bold text-federal-navy-900 mb-2">
                      {tier.name}
                    </h3>
                    
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-4xl font-bold text-federal-navy-900">{tier.price}</span>
                      <span className="text-federal-charcoal-600">{tier.period}</span>
                    </div>
                    
                    <p className="text-sm text-federal-charcoal-600">{tier.description}</p>
                  </div>
                  
                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-federal-charcoal-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${
                          feature.included ? 'text-federal-charcoal-800' : 'text-federal-charcoal-400'
                        }`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* CTA */}
                  <Link
                    href={tier.ctaHref}
                    className={`block w-full py-3 text-center font-bold uppercase tracking-wider text-sm transition-colors ${
                      isPopular
                        ? 'bg-federal-gold-500 text-federal-navy-900 hover:bg-federal-gold-400 shadow-brutal-gold'
                        : tier.name === 'Enterprise'
                        ? 'bg-federal-navy-900 text-white hover:bg-federal-navy-800 shadow-brutal'
                        : 'bg-white border-2 border-federal-charcoal-200 text-federal-charcoal-600 hover:border-federal-navy-900 hover:text-federal-navy-900'
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 border-t-2 border-federal-charcoal-200">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="heading-hero mb-4">WHO USES OUR DATA?</h2>
            <p className="text-lg text-federal-charcoal-600 max-w-2xl mx-auto">
              From individual researchers to Fortune 500 companies, 
              our data powers critical decisions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-0">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <div 
                  key={useCase.title}
                  className={`p-6 border-2 border-federal-charcoal-200 ${
                    index % 2 === 0 ? 'bg-federal-navy-50' : 'bg-white'
                  }`}
                >
                  <Icon className="h-8 w-8 text-federal-navy-900 mb-4" />
                  <h3 className="font-serif font-semibold text-federal-navy-900 mb-2">
                    {useCase.title}
                  </h3>
                  <p className="text-sm text-federal-charcoal-600">
                    {useCase.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-federal-charcoal-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="heading-hero text-white text-center mb-12">
            FREQUENTLY ASKED
          </h2>
          
          <div className="space-y-0">
            {[
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards (Visa, Mastercard, Amex) and PayPal. Enterprise plans can pay via invoice.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes! No long-term contracts. Cancel anytime and keep access until the end of your billing period.',
              },
              {
                q: 'Is there a free trial for Pro?',
                a: 'Yes! Start with a 14-day free trial of Pro. No credit card required to start.',
              },
              {
                q: 'What data sources do you use?',
                a: 'All data comes directly from official U.S. government APIs: Treasury, BLS, FEC, DHS, and more.',
              },
              {
                q: 'Do you offer educational discounts?',
                a: 'Yes! Students and educators get 50% off Pro plans. Contact us with your .edu email.',
              },
            ].map((faq, i) => (
              <div key={i} className="border-b border-federal-charcoal-700 py-6">
                <h3 className="font-serif font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-federal-charcoal-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-federal-red-600 py-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute top-0 left-0 right-0 h-4 bg-federal-gold-500 transform skew-y-1 origin-top-right"></div>
        
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="heading-hero text-white mb-6">
            READY TO GET STARTED?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Join thousands of researchers, analysts, and citizens using our platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup?plan=pro"
              className="inline-flex items-center justify-center gap-2 bg-federal-gold-500 text-federal-navy-900 px-8 py-4 font-bold uppercase tracking-wider shadow-brutal-gold hover:bg-federal-gold-400 transition-colors"
            >
              <Crown className="h-5 w-5" />
              Start Free Trial
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-white text-federal-navy-900 px-8 py-4 font-bold uppercase tracking-wider shadow-brutal hover:bg-gray-100 transition-colors"
            >
              Explore Free Data
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
