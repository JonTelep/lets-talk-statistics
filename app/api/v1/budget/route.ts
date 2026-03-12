import { NextRequest, NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/gov-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalYear = parseInt(searchParams.get('fiscal_year') || '') || new Date().getFullYear();
    
    // Monthly Treasury Statement
    const url = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_5";
    const params = new URLSearchParams({
      filter: `record_fiscal_year:eq:${fiscalYear}`,
      sort: "-record_date",
      "page[size]": "1000",
    });
    
    const data = await fetchWithCache(`${url}?${params}`);
    
    const result = {
      source: "U.S. Treasury Monthly Statement",
      fiscal_year: fiscalYear,
      fetched_at: new Date().toISOString(),
      data: data.data || []
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching budget data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget data' },
      { status: 500 }
    );
  }
}