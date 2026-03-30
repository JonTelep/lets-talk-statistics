import { NextRequest, NextResponse } from 'next/server';
import {
  getCategories,
  getSeriesList,
  getObservations,
  getCompare,
  getDashboard,
  getSyncStatus,
} from '@/lib/services/housing-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug = [] } = await params;
  const path = slug.join('/');
  const { searchParams } = request.nextUrl;

  try {
    switch (path) {
      case 'categories':
        return NextResponse.json({ source: 'FRED (Federal Reserve Economic Data)', categories: await getCategories() });

      case 'series':
        return NextResponse.json(await getSeriesList(searchParams.get('category') || undefined));

      case 'dashboard':
        return NextResponse.json(await getDashboard());

      case 'compare': {
        const ids = searchParams.get('series_ids');
        if (!ids) return NextResponse.json({ error: 'series_ids parameter required' }, { status: 400 });
        const seriesIds = ids.split(',').map((s) => s.trim()).filter(Boolean);
        return NextResponse.json(
          await getCompare(seriesIds, searchParams.get('start_date') || undefined, searchParams.get('end_date') || undefined),
        );
      }

      case 'sync/status':
        return NextResponse.json(await getSyncStatus());

      default: {
        // observations/{series_id}
        if (slug.length >= 2 && slug[0] === 'observations') {
          const seriesId = slug[1];
          return NextResponse.json(
            await getObservations(seriesId, searchParams.get('start_date') || undefined, searchParams.get('end_date') || undefined),
          );
        }
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    }
  } catch (error) {
    console.error('Housing API error:', error);
    const message = error instanceof Error ? error.message : String(error);
    const status = message.includes('FRED_API_KEY') ? 503 : 500;
    return NextResponse.json({ error: 'Failed to fetch housing data', details: message }, { status });
  }
}
