# ADR-001: Use Recharts for Data Visualization

**Date:** 2026-02-01  
**Status:** Accepted  
**Author:** Jarvis

## Context
The lets-talk-statistics dashboard needs interactive charts to visualize government data (debt trends, employment rates, budget breakdowns, etc.). We needed a charting library that:
- Works well with Next.js/React
- Has good TypeScript support
- Is actively maintained
- Handles responsive design

## Decision
Use **Recharts** for all data visualization in the application.

## Consequences

### Pros
- Built on D3.js but with React-friendly API
- Excellent TypeScript support
- Responsive out of the box
- Good documentation and examples
- Declarative component-based approach fits React patterns
- Supports all chart types we need (line, bar, pie, area)

### Cons
- Bundle size is non-trivial (~400KB)
- Some advanced customizations require diving into D3
- Limited animation options compared to other libraries

## Alternatives Considered

**Chart.js + react-chartjs-2**
- Rejected: Less React-idiomatic, canvas-based (harder to style)

**Victory**
- Rejected: More verbose API, less intuitive for simple charts

**Nivo**
- Rejected: Heavier bundle, more complex setup

**D3.js directly**
- Rejected: Too low-level for our needs, more code to maintain
