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