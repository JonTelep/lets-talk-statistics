import { NextRequest, NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/gov-api';

function parseAmount(value: any): number {
  if (value === null || value === undefined) return 0.0;
  if (typeof value === 'number') return value;
  try {
    return parseFloat(String(value).replace(/,/g, ''));
  } catch {
    return 0.0;
  }
}

function getCurrentFiscalYear(): number {
  const today = new Date();
  return today.getMonth() >= 9 ? today.getFullYear() + 1 : today.getFullYear(); // Oct-Sep
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalYear = parseInt(searchParams.get('fiscal_year') || '') || getCurrentFiscalYear();
    
    // Treasury Fiscal Data API
    const url = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/interest_expense";
    
    // Fetch current FY + previous 5
    const years = Array.from({ length: 6 }, (_, i) => fiscalYear - 5 + i);
    const filterStr = years.join(',');
    
    const params = new URLSearchParams({
      filter: `record_fiscal_year:in:(${filterStr})`,
      sort: "-record_date",
      "page[size]": "10000",
      format: "json"
    });
    
    const data = await fetchWithCache(`${url}?${params}`);
    const records = data.data || [];
    
    // Aggregate by fiscal year
    const fyTotals: Record<number, number> = {};
    const monthlyCurrent: Array<{
      date: string;
      month: string;
      expense_type: string;
      amount: number;
    }> = [];
    
    for (const r of records) {
      const rFy = parseInt(r.record_fiscal_year || '0');
      const amount = parseAmount(r.expense_amt);
      fyTotals[rFy] = (fyTotals[rFy] || 0) + amount;
      
      if (rFy === fiscalYear) {
        monthlyCurrent.push({
          date: r.record_date || '',
          month: r.record_calendar_month || '',
          expense_type: r.expense_type_desc || '',
          amount
        });
      }
    }
    
    const annual = years
      .filter(y => (fyTotals[y] || 0) > 0)
      .map(y => ({
        fiscal_year: y,
        total: Math.round((fyTotals[y] || 0) * 100) / 100
      }));
    
    monthlyCurrent.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    
    const result = {
      current_fy: fiscalYear,
      annual,
      monthly_current_fy: monthlyCurrent,
      source: "Treasury Fiscal Data API",
      fetched_at: new Date().toISOString()
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching interest expense data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interest expense data' },
      { status: 500 }
    );
  }
}