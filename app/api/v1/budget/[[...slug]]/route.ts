import { NextRequest, NextResponse } from 'next/server';
import { getBudgetData } from '@/lib/services/budget-service';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  try {
    const fy = searchParams.get('fiscal_year');
    return NextResponse.json(await getBudgetData(fy ? parseInt(fy) : undefined));
  } catch (error) {
    console.error('Budget API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget data', details: String(error) },
      { status: 500 },
    );
  }
}
