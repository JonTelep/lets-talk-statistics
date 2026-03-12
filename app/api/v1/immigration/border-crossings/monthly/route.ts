import { NextRequest, NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/gov-api';

const BTS_BASE_URL = "https://data.bts.gov/resource/keg4-3bc2.json";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const months = parseInt(searchParams.get('months') || '12');
    
    // Get recent data
    const params = new URLSearchParams({
      "$limit": "5000",
      "$order": "date DESC",
      "$where": `date_extract_y(date)>=${year - 1}` // Get current and previous year
    });
    
    const data = await fetchWithCache(`${BTS_BASE_URL}?${params}`, { ttlHours: 6 });
    
    // Group by year-month
    const monthlyData: Record<string, {
      total: number;
      records: number;
      borders: Set<string>;
      measures: Set<string>;
    }> = {};
    
    for (const record of data) {
      if (!record.date || !record.value) continue;
      
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          total: 0,
          records: 0,
          borders: new Set(),
          measures: new Set()
        };
      }
      
      monthlyData[monthKey].total += parseInt(record.value) || 0;
      monthlyData[monthKey].records += 1;
      if (record.border) monthlyData[monthKey].borders.add(record.border);
      if (record.measure) monthlyData[monthKey].measures.add(record.measure);
    }
    
    // Convert to array and sort by month descending
    const monthlySummary = Object.entries(monthlyData)
      .map(([month, stats]) => ({
        month,
        total_crossings: stats.total,
        record_count: stats.records,
        border_count: stats.borders.size,
        measure_count: stats.measures.size
      }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, months);
    
    const result = {
      source: "Bureau of Transportation Statistics (BTS)",
      fetched_at: new Date().toISOString(),
      summary: {
        months_shown: monthlySummary.length,
        total_crossings: monthlySummary.reduce((sum, m) => sum + m.total_crossings, 0),
        latest_month: monthlySummary[0]?.month || null
      },
      monthly_data: monthlySummary
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching monthly border crossings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monthly border crossings data' },
      { status: 500 }
    );
  }
}