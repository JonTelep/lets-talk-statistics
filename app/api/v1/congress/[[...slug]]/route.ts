import { NextRequest, NextResponse } from 'next/server';
import {
  getCongressOverview,
  getRecentTrades,
  getTopPoliticians,
  getPoliticianTrades,
} from '@/lib/services/congress-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug = [] } = await params;
  const path = slug.join('/');
  const { searchParams } = request.nextUrl;

  try {
    switch (path) {
      case 'trades': {
        const limit = parseInt(searchParams.get('limit') || '50') || 50;
        return NextResponse.json(await getRecentTrades(limit));
      }
      case 'politicians':
        return NextResponse.json(await getTopPoliticians());
      default:
        // Check if path is a politician slug like "politicians/nancy-pelosi"
        if (path.startsWith('politicians/')) {
          const politician = path.replace('politicians/', '');
          return NextResponse.json(await getPoliticianTrades(politician));
        }
        return NextResponse.json(await getCongressOverview());
    }
  } catch (error) {
    console.error('Congress API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch congress data', details: String(error) },
      { status: 500 },
    );
  }
}
