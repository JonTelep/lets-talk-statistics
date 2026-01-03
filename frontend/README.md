# Let's Talk Statistics - Frontend

A modern, objective platform for exploring US crime statistics from government sources.

## Features

- **Homepage** with clear definitions of "Statistics" and "Per Capita" front and center
- **Explore Page** for browsing crime data with filters and data tables
- **Compare Page** for state-to-state and year-to-year comparisons
- **Trends Page** for visualizing crime trends over time
- **About Page** with methodology and data source information

## Tech Stack

- **Framework**: Next.js 15.1.2 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on http://localhost:8000

## Getting Started

1. **Install dependencies**

```bash
cd frontend
npm install
```

2. **Set up environment variables**

The `.env.local` file is already configured with:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SITE_NAME=Let's Talk Statistics
```

Modify if your backend runs on a different URL.

3. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production**

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with Header/Footer
│   ├── page.tsx             # Homepage
│   ├── explore/             # Explore data page
│   ├── compare/             # Compare states/years page
│   ├── trends/              # Trends visualization page
│   └── about/               # About & methodology page
├── components/
│   ├── layout/              # Header, Footer
│   ├── home/                # Homepage components
│   ├── ui/                  # Reusable UI components
│   ├── filters/             # Filter components
│   ├── charts/              # Chart components
│   └── data/                # Data table components
├── lib/
│   ├── api/                 # API client configuration
│   ├── types/               # TypeScript types
│   └── hooks/               # Custom React hooks
├── styles/
│   └── globals.css          # Global styles
└── public/                  # Static assets
```

## Key Design Principles

1. **Objective Presentation**: No opinions or narratives, just data
2. **Mobile-First**: Responsive design that works on all devices
3. **Accessibility**: WCAG 2.1 AA compliant
4. **Performance**: Optimized for fast loading and smooth interactions
5. **No Accounts**: Free and open access to all features

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Integration

The frontend connects to the backend API at `NEXT_PUBLIC_API_URL`. Key endpoints used:

- `/statistics/` - Get crime statistics
- `/statistics/per-capita` - Get per capita rates
- `/comparisons/states` - Compare two states
- `/comparisons/years` - Compare two years
- `/trends` - Get trend data over time
- `/analytics/summary` - Get summary statistics
- `/csv/export` - Export data to CSV

## Contributing

This is an educational project. Contributions are welcome to improve data visualization, accessibility, or add new features that maintain the objective presentation of data.

## Data Sources

All data comes from official US government sources:
- FBI Crime Data Explorer
- US Census Bureau
- Bureau of Justice Statistics

## License

This project is for educational purposes. Data is sourced from public government databases.
