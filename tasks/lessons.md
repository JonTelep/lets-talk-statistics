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

## 2026-02-24: Overnight Session - SEO & Conversion Optimization

### Business Intelligence Implementation
- **Capitol Trades API Callout**: Added prominent CTA on Congress page driving users to telep.io/pricing
- **Conversion Funnel Optimization**: Free data visualization → API access → Premium subscriptions
- **Strategic Placement**: API callout positioned after stats grid for maximum visibility
- **Call-to-Action Design**: Gradient blue/purple card with "Get API Access" button + "Free tier available" note

### SEO Implementation Fixes
- **PageSEO Component Repair**: Component existed but wasn't rendering actual HTML meta tags (critical bug)
- **Missing Next.js Head Import**: Added proper Head component import for meta tag rendering
- **Comprehensive Meta Tags**: Title, description, keywords, canonical URLs, robots directives
- **Open Graph Optimization**: Full OG tags for social media sharing (Facebook, LinkedIn)
- **Twitter Cards**: Optimized Twitter card support with @telep_io handle
- **Structured Data**: JSON-LD with Dataset schema for enhanced search engine understanding

### Technical Validation
- **Build Success**: Next.js build completed successfully generating 15 static pages
- **Container Testing**: Both frontend and backend containers build and run without errors
- **SEO Component Architecture**: PageSEO + StructuredData component separation works well
- **No Import Errors**: All dependencies resolved, TypeScript compilation clean

### Revenue Impact Expectations
- **Organic Traffic**: Structured data and meta tags should improve search rankings
- **Conversion Rate**: Prominent API callout increases API sign-up likelihood
- **Social Sharing**: OG tags improve content virality and professional appearance
- **Search Engine Visibility**: Government dataset markup helps with specialized search queries

### Development Process Insights
- **CLAUDE.md Updates**: Following MEMORY.md requirement to update repo documentation with changes
- **Incremental Testing**: Container builds using cache made iteration faster
- **Feature Branch Workflow**: Clean branch naming and commit messages for tracking
- **Overnight Optimization**: Perfect use case for overnight sessions - technical debt and growth features