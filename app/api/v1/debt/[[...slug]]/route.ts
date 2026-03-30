import { NextRequest, NextResponse } from 'next/server';
import {
  getDebtHistory,
  getDebtLatest,
  getHoldersComposition,
  getHoldersHistory,
  getInterestExpense,
  getAvgInterestRates,
  getForeignHolders,
  getDebtToGdp,
} from '@/lib/services/debt-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug = [] } = await params;
  const path = slug.join('/');
  const { searchParams } = request.nextUrl;

  try {
    switch (path) {
      case 'latest':
        return NextResponse.json(await getDebtLatest());
      case 'holders':
        return NextResponse.json(await getHoldersComposition());
      case 'holders/history':
        return NextResponse.json(await getHoldersHistory());
      case 'interest': {
        const fy = searchParams.get('fiscal_year');
        return NextResponse.json(await getInterestExpense(fy ? parseInt(fy) : undefined));
      }
      case 'rates':
        return NextResponse.json(await getAvgInterestRates());
      case 'foreign-holders':
        return NextResponse.json(await getForeignHolders());
      case 'gdp-ratio':
        return NextResponse.json(await getDebtToGdp());
      default: {
        const days = parseInt(searchParams.get('days') || '365') || 365;
        return NextResponse.json(await getDebtHistory(days));
      }
    }
  } catch (error) {
    console.error('Debt API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debt data', details: String(error) },
      { status: 500 },
    );
  }
}
