import { NextRequest, NextResponse } from 'next/server';
import { getOverview, getEnrollmentData, getDshPayments } from '@/lib/services/healthcare-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug = [] } = await params;
  const path = slug.join('/');

  try {
    switch (path) {
      case 'enrollment':
        return NextResponse.json(await getEnrollmentData());
      case 'dsh':
        return NextResponse.json(await getDshPayments());
      default:
        return NextResponse.json(await getOverview());
    }
  } catch (error) {
    console.error('Healthcare API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch healthcare data', details: String(error) },
      { status: 500 },
    );
  }
}
