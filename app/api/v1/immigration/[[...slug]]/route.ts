import { NextRequest, NextResponse } from 'next/server';
import {
  getOverview,
  getSummaryStats,
  getHistoricalEnforcement,
  getImmigrationByCategory,
  getTopSourceCountries,
  getBorderCrossings,
} from '@/lib/services/immigration-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug = [] } = await params;
  const path = slug.join('/');
  const { searchParams } = request.nextUrl;

  try {
    switch (path) {
      case 'summary':
        return NextResponse.json(await getSummaryStats());
      case 'historical': {
        const start = searchParams.get('start_year');
        const end = searchParams.get('end_year');
        return NextResponse.json(
          await getHistoricalEnforcement(
            start ? parseInt(start) : undefined,
            end ? parseInt(end) : undefined,
          ),
        );
      }
      case 'categories':
        return NextResponse.json(await getImmigrationByCategory());
      case 'countries': {
        const limit = parseInt(searchParams.get('limit') || '10') || 10;
        return NextResponse.json(await getTopSourceCountries(limit));
      }
      case 'crossings':
        return NextResponse.json(
          await getBorderCrossings(
            searchParams.get('border') || undefined,
            searchParams.get('measure') || undefined,
            searchParams.get('state') || undefined,
            searchParams.has('year') ? parseInt(searchParams.get('year')!) : undefined,
            parseInt(searchParams.get('limit') || '1000'),
          ),
        );
      default:
        return NextResponse.json(await getOverview());
    }
  } catch (error) {
    console.error('Immigration API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch immigration data', details: String(error) },
      { status: 500 },
    );
  }
}
