import { MetadataRoute } from 'next';
import { site } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://letstalkstatistics.com';
  const lastModified = new Date(site.generated_at);
  const paths = ['', '/prices', '/budget', '/economy', '/energy', '/crime', '/immigration', '/sources', ...site.charts.map((chart) => `/c/${chart.id}`)];

  return paths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: path === '' ? 1 : path.startsWith('/c/') ? 0.6 : 0.8,
  }));
}
