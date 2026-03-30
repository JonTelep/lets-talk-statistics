import { NextRequest, NextResponse } from 'next/server';
import {
  getOverview,
  getEnrollmentStats,
  getSpendingStats,
  getOutcomesStats,
} from '@/lib/services/education-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug = [] } = await params;
  const path = slug.join('/');
  const { searchParams } = request.nextUrl;

  try {
    switch (path) {
      case 'enrollment': {
        const years = parseInt(searchParams.get('years') || '5') || 5;
        return NextResponse.json(await getEnrollmentStats(years));
      }
      case 'spending':
        return NextResponse.json(await getSpendingStats());
      case 'outcomes':
        return NextResponse.json(await getOutcomesStats());
      default:
        return NextResponse.json(await getOverview());
    }
  } catch (error) {
    console.error('Education API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch education data', details: String(error) },
      { status: 500 },
    );
  }
}
