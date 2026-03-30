import { NextRequest, NextResponse } from 'next/server';
import { getCandidateTotals, getPopulationData } from '@/lib/services/elections-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug = [] } = await params;
  const path = slug.join('/');
  const { searchParams } = request.nextUrl;

  try {
    switch (path) {
      case 'candidates': {
        const cycle = searchParams.get('cycle');
        return NextResponse.json(await getCandidateTotals(cycle ? parseInt(cycle) : undefined));
      }
      case 'population': {
        const year = searchParams.get('year');
        return NextResponse.json(await getPopulationData(year ? parseInt(year) : undefined));
      }
      default:
        return NextResponse.json(await getCandidateTotals());
    }
  } catch (error) {
    console.error('Elections API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch elections data', details: String(error) },
      { status: 500 },
    );
  }
}
