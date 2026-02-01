# tasks/lessons.md - lets-talk-statistics

## Build & Deploy
- **Always test containers before PRs** - PRs #6-8 caused startup failures due to missing config. Run `make build && make dev` and check logs.
- **Next.js config matters** - Default API URLs need to be set in next.config.js for production builds.

## Data Integration
- **Use real APIs, not mock data** - Jon prefers actual government data sources. Treasury Fiscal Data, BLS, FEC all have free APIs.
- **Add loading states first** - Skeleton loaders make the app feel fast even when APIs are slow.

## Code Quality
- **Recharts for visualization** - Works well with Next.js, good TypeScript support.
- **Error boundaries with retry** - Users should be able to recover from failed API calls without refreshing.

## PR Management
- **Resolve conflicts early** - Don't let PRs pile up. Merge conflicts compound.
- **Keep PRs focused** - One feature per PR makes review easier.
