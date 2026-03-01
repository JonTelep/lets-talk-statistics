# tasks/lessons.md - lets-talk-statistics

## Architecture Decisions
- **Next.js + FastAPI** - Good separation of concerns, easy development
- **Recharts for visualization** - Much better than trying to build charts from scratch
- **Real government APIs** - Users want real data, not mock data

## Data Integration
- **Loading states matter** - Skeleton loaders make the app feel much faster
- **Error boundaries are essential** - APIs fail, handle gracefully
- **Cache API responses** - Government APIs can be slow

## User Experience
- **Charts add massive value** - Raw tables are boring, visuals tell the story
- **Last updated timestamps** - Users want to know data freshness
- **Responsive design first** - Mobile traffic is significant

## Performance
- **Container testing is crucial** - Always test with `make build && make dev` before PRs
- **Monitor bundle size** - Next.js makes it easy to bloat

## Security
- **Keep dependencies updated** - Next.js 15.5.11 fixed 5 high severity vulns
- **Validate all external data** - Government APIs can have malformed responses

## Project Management
- **Small, focused PRs** - Much easier to review and merge
- **Standard repo structure** - Consistent across all Telep IO projects
- **Document architectural decisions** - Future maintainers will thank you

## SEO & Marketing (Feb 24, 2026)
- **SEO layouts per page** - Next.js App Router metadata API is powerful for per-page SEO
- **JSON-LD structured data** - Essential for government data visibility in search
- **API promotion callouts** - Converting free users to API customers requires prominent CTAs
- **OpenGraph optimization** - Social sharing drives traffic, needs good meta tags
- **Government data schema** - Dataset-specific schema markup improves search ranking
- **Build verification essential** - Always test container builds after SEO/metadata changes

## Healthcare Page Implementation (Feb 25, 2026)
- **TypeScript tooltip formatters** - Use `any` types for Recharts tooltip formatters to avoid ValueType conflicts
- **DownloadRawData component** - Requires `endpoints` array with `{label, url, filename}` objects
- **Healthcare data structure** - DSH payments provide rich provider and utilization data
- **Container build validation** - Always run full `make build` to catch TypeScript errors before deployment
- **Healthcare visualization patterns** - Line charts for trends, pie charts for breakdowns, tables for rankings work well
- **SEO for healthcare data** - CMS/Medicaid.gov schema markup improves discoverability

## Advanced SEO Implementation (Feb 28, 2026)
- **Server-side metadata** - Converting client components to server components with metadata dramatically improves SEO
- **Component architecture for SEO** - Split pages: server component (metadata) + client component (interactivity)
- **GovernmentDataStructuredData** - Reusable component for JSON-LD schema markup on government datasets
- **Page-specific OpenGraph** - Each page needs unique og:image and tailored descriptions for social sharing
- **Education & Immigration optimization** - Department of Education and DHS-specific schema markup
- **Zero breaking changes** - SEO improvements should maintain all existing functionality
- **Sitemap completeness** - Ensure all pages are included with appropriate priority and changeFrequency