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

### 2026-03-03: SEO Optimization Completion (Overnight Work)
- **Consistent SEO Pattern**: Created layout.tsx files for about, elections, and immigration pages following existing debt/employment pattern
- **Comprehensive Metadata**: Each page now has OpenGraph, Twitter Cards, and JSON-LD structured data
- **Schema.org Integration**: Used appropriate schema types (Organization, Dataset) for different page content
- **Build Verification**: All 17 pages pre-render successfully with no TypeScript errors
- **Search Visibility**: Complete SEO coverage across all major pages for better discoverability

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

## Overnight SEO Expansion (Mar 2, 2026)
- **Missing page layouts** - Multiple high-traffic pages lacked SEO optimization (congress, budget, debt, employment)
- **Consistent SEO pattern** - Established template for structured data, OpenGraph, and meta tags across all government data pages
- **TypeScript property mismatches** - Immigration component had several interface mismatches requiring data property corrections
- **Build verification critical** - TypeScript errors in production containers block deployment, requires thorough testing
- **SEO layout coverage** - Added comprehensive SEO layouts for 4 major government data categories
- **Capitol Trades integration** - Congress page SEO now promotes Capitol Trades API as data source with proper attribution

## TypeScript Build Error Resolution (Mar 2, 2026)
- **Interface property alignment** - API response types must exactly match component usage patterns
  - `historicalData?.historical` vs `historicalData?.data` - check actual API response structure
  - `summaryData?.lastUpdated` vs `summaryData?.fetched_at` - verify property names with backend
- **Recharts type compatibility** - Tooltip formatter functions need flexible types for value/name parameters
  - Use `any` types for `value` and `name` parameters to avoid ValueType/NameType conflicts
  - Convert values with `Number(value) || 0` and `String(name)` for type safety
- **Component import patterns** - SEO component imports must match actual exports
  - `StructuredData` import should be `WebsiteStructuredData` (specific component)
  - Unused imports like `JsonLd` from non-existent Next.js paths cause build failures
- **Build process validation** - Always run full TypeScript build before deployment
  - `npm run build` reveals production-only type errors missed in development
  - Static generation success indicates all components compile correctly
- **Frontend/backend separation** - Project structure with separate frontend/ directory requires proper paths
- **Zero tolerance for build errors** - TypeScript errors in production completely block deployment