/**
 * Social sharing component for government data pages
 * Provides optimized sharing for Twitter, Facebook, LinkedIn, and direct link copying
 */

'use client';

import { useState } from 'react';
import { Share2, Twitter, Facebook, Linkedin, Link, Check } from 'lucide-react';
import Button from './Button';

interface SocialShareProps {
  url?: string;
  title: string;
  description?: string;
  hashtags?: string[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical' | 'compact';
}

export function SocialShare({
  url,
  title,
  description = 'Explore U.S. government data and statistics.',
  hashtags = ['data', 'statistics', 'government'],
  className = '',
  size = 'md',
  layout = 'horizontal',
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const hashtagString = hashtags.map(tag => tag.replace('#', '')).join(',');

  // Social media share URLs
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&hashtags=${hashtagString}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
      }
      document.body.removeChild(textArea);
    }
  };

  const openShareWindow = (shareUrl: string, platform: string) => {
    const width = platform === 'linkedin' ? 600 : 550;
    const height = platform === 'linkedin' ? 650 : 450;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    window.open(
      shareUrl,
      `share-${platform}`,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  const buttonSizes = {
    sm: 'p-2',
    md: 'p-2.5',
    lg: 'p-3',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  if (layout === 'compact') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <details className="relative">
          <summary className="list-none cursor-pointer">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-surface-400 hover:text-surface-200"
            >
              <Share2 className={iconSizes[size]} />
              <span className="text-sm">Share</span>
            </Button>
          </summary>
          <div className="absolute top-full left-0 mt-1 bg-surface-800 border border-border rounded-lg shadow-lg p-2 z-50 min-w-40">
            <div className="flex flex-col gap-1">
              <button
                onClick={() => openShareWindow(shareUrls.twitter, 'twitter')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-surface-300 hover:text-surface-100 hover:bg-surface-700 rounded transition-colors"
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </button>
              <button
                onClick={() => openShareWindow(shareUrls.facebook, 'facebook')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-surface-300 hover:text-surface-100 hover:bg-surface-700 rounded transition-colors"
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </button>
              <button
                onClick={() => openShareWindow(shareUrls.linkedin, 'linkedin')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-surface-300 hover:text-surface-100 hover:bg-surface-700 rounded transition-colors"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-3 py-2 text-sm text-surface-300 hover:text-surface-100 hover:bg-surface-700 rounded transition-colors"
              >
                {copied ? <Check className="h-4 w-4" /> : <Link className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </details>
      </div>
    );
  }

  const containerClass = layout === 'vertical' ? 'flex flex-col gap-2' : 'flex items-center gap-2';

  return (
    <div className={`${containerClass} ${className}`}>
      <span className="text-sm text-surface-500 font-medium">Share:</span>
      <div className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-row'} gap-2`}>
        <button
          onClick={() => openShareWindow(shareUrls.twitter, 'twitter')}
          className={`${buttonSizes[size]} bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center`}
          title="Share on Twitter"
        >
          <Twitter className={iconSizes[size]} />
          {layout === 'vertical' && <span className="ml-2 text-sm">Twitter</span>}
        </button>

        <button
          onClick={() => openShareWindow(shareUrls.facebook, 'facebook')}
          className={`${buttonSizes[size]} bg-blue-800 hover:bg-blue-900 text-white rounded-lg transition-colors flex items-center justify-center`}
          title="Share on Facebook"
        >
          <Facebook className={iconSizes[size]} />
          {layout === 'vertical' && <span className="ml-2 text-sm">Facebook</span>}
        </button>

        <button
          onClick={() => openShareWindow(shareUrls.linkedin, 'linkedin')}
          className={`${buttonSizes[size]} bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors flex items-center justify-center`}
          title="Share on LinkedIn"
        >
          <Linkedin className={iconSizes[size]} />
          {layout === 'vertical' && <span className="ml-2 text-sm">LinkedIn</span>}
        </button>

        <button
          onClick={handleCopyLink}
          className={`${buttonSizes[size]} bg-surface-700 hover:bg-surface-600 text-white rounded-lg transition-colors flex items-center justify-center`}
          title={copied ? 'Link copied!' : 'Copy link'}
        >
          {copied ? (
            <Check className={iconSizes[size]} />
          ) : (
            <Link className={iconSizes[size]} />
          )}
          {layout === 'vertical' && (
            <span className="ml-2 text-sm">{copied ? 'Copied!' : 'Copy Link'}</span>
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Optimized sharing data for specific government statistics pages
 */
export const shareConfigs = {
  debt: {
    title: 'U.S. National Debt Statistics',
    description: 'Real-time tracking of federal debt, holders analysis, and historical growth patterns.',
    hashtags: ['nationaldebt', 'federaldebt', 'treasury', 'data'],
  },
  congress: {
    title: 'Congressional Stock Trading Data',
    description: 'Track congressional stock trades and STOCK Act disclosures from elected officials.',
    hashtags: ['congress', 'stocktrading', 'transparency', 'politics'],
  },
  employment: {
    title: 'U.S. Employment Statistics',
    description: 'Latest unemployment rates and employment data from the Bureau of Labor Statistics.',
    hashtags: ['employment', 'unemployment', 'jobs', 'BLS'],
  },
  immigration: {
    title: 'U.S. Immigration Statistics',
    description: 'Border encounters, legal admissions, and immigration trends from official sources.',
    hashtags: ['immigration', 'borders', 'migration', 'DHS'],
  },
  budget: {
    title: 'Federal Budget Analysis',
    description: 'Federal spending, revenue, and budget data from the U.S. Treasury.',
    hashtags: ['budget', 'federalspending', 'revenue', 'treasury'],
  },
  elections: {
    title: 'Election Finance Data',
    description: 'Campaign finance and election spending data from the Federal Election Commission.',
    hashtags: ['elections', 'campaignfinance', 'FEC', 'politics'],
  },
  healthcare: {
    title: 'Healthcare Statistics',
    description: 'Medicaid, Medicare, and healthcare spending data from CMS and HHS.',
    hashtags: ['healthcare', 'medicaid', 'medicare', 'CMS'],
  },
  education: {
    title: 'Education Statistics',
    description: 'Student enrollment, outcomes, and education spending from Department of Education.',
    hashtags: ['education', 'students', 'schools', 'DoE'],
  },
};