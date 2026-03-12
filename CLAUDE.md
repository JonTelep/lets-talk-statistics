# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⛔ HARD RULES
- **NO REDESIGNS** — never change visual design, color schemes, typography, fonts, or layout aesthetics
- Overnight/automated runs: optimization, features, SEO, and bug fixes ONLY
- Design changes require explicit approval from Jon

## Project Overview

**Let's Talk Statistics** is a platform for exploring US government statistics from official sources. It presents data without spin - no opinions, no narratives, just data.

**Live site:** https://letstalkstatistics.com
**GitHub:** https://github.com/JonTelep/lets-talk-statistics

## Architecture (v3.0.0)

**Single Container Architecture**: Next.js 16.1.6 with TypeScript, using Bun for package management and file-based caching.

```
Frontend & Backend (Next.js:3000) → Government APIs
                ↓
    File Cache (/tmp/lts-cache/*.json)
```

### Key Changes from v2.x
- **Removed**: Python/FastAPI backend (6,875 lines) and separate container
- **Added**: 35+ Next.js Route Handlers serving all API endpoints
- **Changed**: From 2-container to single-container architecture
- **Changed**: Package manager from npm to Bun
- **Changed**: Housing data from Postgres to direct FRED API calls
- **Improved**: File-based cache with stale-on-error fallback for reliability

## Quick Start

```bash
npm run dev           # Development (Next.js with Turbopack)
make build           # Build container image
make dev             # Start container with logs
# App: http://localhost:3000
```

## Development Commands

### Container (Recommended - uses Podman)

```bash
make build           # Build container image
make up              # Start container (detached)
make dev             # Start container with logs
make down            # Stop container
make clean           # Stop container and remove image
make logs            # View container logs
make ps              # Show container status
```

### Local Development

```bash
npm run dev          # Next.js development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
```

## API Architecture

All government data APIs are now served as **Next.js Route Handlers** in `app/api/v1/`:

### Core APIs (35+ endpoints)

#### Health
- `GET /api/v1/health` — Health check

#### Debt (8 routes)
- `GET /api/v1/debt` — Treasury debt history
- `GET /api/v1/debt/latest` — Current debt figure
- `GET /api/v1/debt/holders` — FRED debt holders composition
- `GET /api/v1/debt/holders/history` — FRED holders over time
- `GET /api/v1/debt/interest` — Treasury interest expense
- `GET /api/v1/debt/rates` — Treasury avg interest rates
- `GET /api/v1/debt/foreign-holders` — TIC foreign holders data
- `GET /api/v1/debt/gdp-ratio` — FRED debt-to-GDP

#### Employment (2 routes)
- `GET /api/v1/employment/unemployment` — BLS unemployment history
- `GET /api/v1/employment/unemployment/latest` — Current unemployment

#### Budget (1 route)
- `GET /api/v1/budget` — Treasury Monthly Statement

#### Elections (2 routes)
- `GET /api/v1/elections/candidates` — FEC candidate fundraising
- `GET /api/v1/elections/population` — Census state populations

#### Immigration (7 routes)
- `GET /api/v1/immigration` — Overview with historical data
- `GET /api/v1/immigration/summary` — Summary statistics
- `GET /api/v1/immigration/historical` — Historical enforcement data
- `GET /api/v1/immigration/categories` — Admission categories
- `GET /api/v1/immigration/countries` — Top source countries
- `GET /api/v1/immigration/border-crossings` — BTS border crossing data
- `GET /api/v1/immigration/border-crossings/monthly` — Monthly summary

#### Congress (6 routes)
- `GET /api/v1/congress/stats` — Trading statistics summary
- `GET /api/v1/congress/trades` — All trades (filterable)
- `GET /api/v1/congress/trades/recent` — Recent trades
- `GET /api/v1/congress/traders` — Top traders ranked
- `GET /api/v1/congress/tickers` — Popular stocks
- `GET /api/v1/congress/tickers/[ticker]` — Trades by ticker

#### Education (6 routes)
- `GET /api/v1/education` — College Scorecard overview
- `GET /api/v1/education/enrollment` — Enrollment statistics
- `GET /api/v1/education/spending` — Education spending (placeholder)
- `GET /api/v1/education/outcomes` — Student outcomes (placeholder)
- `GET /api/v1/education/state-funding` — State funding (placeholder)
- `GET /api/v1/education/performance` — Performance metrics (placeholder)

#### Housing (6 routes)
- `GET /api/v1/housing/categories` — Housing data categories
- `GET /api/v1/housing/series` — Available FRED series
- `GET /api/v1/housing/observations/[seriesId]` — Time series data
- `GET /api/v1/housing/compare` — Series comparison (placeholder)
- `GET /api/v1/housing/dashboard` — Key metrics (placeholder)
- `GET /api/v1/housing/sync/status` — Sync status (not applicable for FRED direct)

## Caching Strategy

**File-Based Cache with Resilience**:
- **Location**: `/tmp/lts-cache/` (created on demand)
- **TTL**: 24 hours default (configurable per endpoint)
- **Stale-on-error**: Serves stale cache if API calls fail
- **Retry logic**: 2 retries with exponential backoff
- **Cache keys**: MD5 hash of request URL

### Cache Implementation (`lib/gov-api.ts`)
```typescript
import { fetchWithCache } from '@/lib/gov-api';

// Uses file-based cache with stale fallback
const data = await fetchWithCache(url, { ttlHours: 6 });
```

## Data Sources

- **Treasury**: Fiscal Data API (debt, interest, budget)
- **FRED**: Federal Reserve Economic Data (debt composition, housing, GDP)
- **BLS**: Bureau of Labor Statistics (unemployment)
- **FEC**: Federal Election Commission (campaign finance)
- **Census**: Population estimates
- **BTS**: Border transportation data
- **Capitol Trades**: Congressional stock trading (trades.telep.io)
- **College Scorecard**: Department of Education

## Performance Features

- **Next.js 16.1.6** with Turbopack for fast development
- **File-based caching** with stale-while-revalidate
- **Container optimization** with multi-stage builds
- **Static generation** for pages where possible
- **TypeScript** for type safety

## Deployment

- **Container**: Single Podman/Docker container
- **Port**: 3000
- **Healthcheck**: `/api/v1/health` endpoint
- **Environment**: Production-optimized with `output: 'standalone'`
- **Cache volume**: `/tmp/lts-cache` for persistent caching

```bash
# Container deployment
podman build --network=host -t lets-talk-statistics .
podman run -d -p 3000:3000 --name lts-app lets-talk-statistics

# Docker Compose
docker-compose up -d
```

## Design System

Dark minimal aesthetic (Palantir/OpenAI-inspired) with light/dark theme toggle:
- **Fonts:** Inter (headings + body), JetBrains Mono (data/code)
- **Colors:** CSS variable-based theme system
- **Theme:** Persisted to localStorage, respects system preference
- **Components:** Shadcn/UI-inspired design system

## Configuration

Environment variables (optional - fallback to demo keys where applicable):

```bash
# API Keys (optional - demo keys used as fallback)
FRED_API_KEY=          # FRED API access
BLS_API_KEY=           # BLS API (higher rate limits)
FEC_API_KEY=           # FEC API access  
CENSUS_API_KEY=        # Census API (higher rate limits)
DOE_API_KEY=           # Department of Education
CAPITOL_TRADES_API=    # Capitol Trades API endpoint
```

## Recent Updates (Mar 12, 2026 - Backend Consolidation)

### Major Architecture Refactor ✅ COMPLETED
- **Eliminated Python backend** — Removed entire FastAPI application (6,875 lines)
- **Consolidated to Next.js** — All 35+ API endpoints now Next.js Route Handlers
- **Single container deployment** — Reduced from 2 containers to 1
- **Bun package manager** — Faster installs and better performance
- **Direct API calls** — Removed database layer for housing data, direct FRED integration
- **Enhanced caching** — File-based cache with stale-on-error fallback for reliability

### Technical Implementation
- **Route Handlers**: Complete TypeScript implementation of all government APIs
- **Cache utility**: `lib/gov-api.ts` with TTL, retries, and stale-on-error
- **Container optimization**: Multi-stage build with Bun + Node.js runtime
- **Type safety**: Full TypeScript coverage with proper error handling

### Benefits
- **Simplified deployment**: One container instead of two
- **Improved reliability**: Stale cache fallback prevents total failures
- **Better performance**: Next.js with Turbopack, Bun package management
- **Easier maintenance**: Single codebase, unified technology stack
- **Enhanced monitoring**: One service to monitor instead of two

### Migration Notes
- Frontend components unchanged — visual compatibility maintained
- API contracts preserved — same endpoints, same response formats  
- Docker Compose simplified to single service
- Makefile updated for single-container operations