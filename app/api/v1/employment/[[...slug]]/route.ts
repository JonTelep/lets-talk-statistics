import { NextRequest, NextResponse } from 'next/server';
import { getUnemploymentRate, getOverview } from '@/lib/services/employment-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug = [] } = await params;
  const path = slug.join('/');
  const { searchParams } = request.nextUrl;

  try {
    switch (path) {
      case 'unemployment': {
        const years = parseInt(searchParams.get('years') || '10') || 10;
        return NextResponse.json(await getUnemploymentRate(years));
      }
      default:
        return NextResponse.json(await getOverview());
    }
  } catch (error) {
    console.error('Employment API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employment data', details: String(error) },
      { status: 500 },
    );
  }
}
