import { NextRequest, NextResponse } from 'next/server';
import { getDebtHistory } from '@/lib/services/debt-service';
import { getUnemploymentRate } from '@/lib/services/employment-service';
import { getBudgetData } from '@/lib/services/budget-service';
import { getTrades } from '@/lib/services/congress-service';

function jsonDownload(data: object, filename: string) {
  const content = JSON.stringify(data, null, 2);
  return new NextResponse(content, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Access-Control-Expose-Headers': 'Content-Disposition',
    },
  });
}

function csvDownload(rows: Record<string, any>[], filename: string) {
  if (!rows.length) {
    return NextResponse.json({ error: 'No data available for export' }, { status: 404 });
  }

  // Flatten nested objects
  const flatRows = rows.map((row) => {
    const flat: Record<string, any> = {};
    for (const [k, v] of Object.entries(row)) {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        for (const [sk, sv] of Object.entries(v)) {
          flat[`${k}_${sk}`] = sv;
        }
      } else {
        flat[k] = v;
      }
    }
    return flat;
  });

  // Collect all field names
  const fieldSet = new Set<string>();
  for (const row of flatRows) Object.keys(row).forEach((k) => fieldSet.add(k));
  const fields = Array.from(fieldSet);

  const lines = [fields.join(',')];
  for (const row of flatRows) {
    lines.push(
      fields.map((f) => {
        const val = row[f] ?? '';
        const str = String(val);
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(','),
    );
  }

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Access-Control-Expose-Headers': 'Content-Disposition',
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug = [] } = await params;
  const path = slug.join('/');
  const { searchParams } = request.nextUrl;
  const format = searchParams.get('format') || 'csv';
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  try {
    switch (path) {
      case 'formats':
        return NextResponse.json({
          description: 'Download government data in CSV or JSON format',
          attribution: 'Data sourced from official U.S. government agencies.',
          datasets: {
            debt: { url: '/api/v1/export/debt', params: { days: 'default 365', format: 'csv or json' } },
            employment: { url: '/api/v1/export/employment', params: { years: 'default 10', format: 'csv or json' } },
            budget: { url: '/api/v1/export/budget', params: { format: 'csv or json' } },
            congress: { url: '/api/v1/export/congress', params: { limit: 'default 500', format: 'csv or json' } },
          },
        });

      case 'debt': {
        const days = parseInt(searchParams.get('days') || '365') || 365;
        const result = await getDebtHistory(days);
        const data = result?.data || [];
        const filename = `national_debt_${timestamp}.${format}`;
        if (format === 'json') {
          return jsonDownload({ dataset: 'national_debt', source: 'U.S. Treasury', exported_at: new Date().toISOString(), records: data.length, data }, filename);
        }
        return csvDownload(Array.isArray(data) ? data : [data], filename);
      }

      case 'employment': {
        const years = parseInt(searchParams.get('years') || '10') || 10;
        const result = await getUnemploymentRate(years);
        const data = result?.data || [];
        const filename = `unemployment_rates_${timestamp}.${format}`;
        if (format === 'json') {
          return jsonDownload({ dataset: 'unemployment_rates', source: 'Bureau of Labor Statistics', exported_at: new Date().toISOString(), records: Array.isArray(data) ? data.length : 1, data }, filename);
        }
        return csvDownload(Array.isArray(data) ? data : [data], filename);
      }

      case 'budget': {
        const fy = searchParams.get('fiscal_year') ? parseInt(searchParams.get('fiscal_year')!) : undefined;
        const result = await getBudgetData(fy);
        const filename = `federal_budget_${fy || 'current'}_${timestamp}.${format}`;
        if (format === 'json') {
          return jsonDownload({ dataset: 'federal_budget', source: 'U.S. Treasury', exported_at: new Date().toISOString(), data: result?.data || result }, filename);
        }
        const rows = result?.data?.annual || [];
        return csvDownload(Array.isArray(rows) ? rows : [rows], filename);
      }

      case 'congress': {
        const limit = parseInt(searchParams.get('limit') || '500') || 500;
        const politician = searchParams.get('politician') || undefined;
        const ticker = searchParams.get('ticker') || undefined;
        const result = await getTrades({ limit, politician, ticker });
        const data = result?.data || [];
        const filename = `congressional_trades_${timestamp}.${format}`;
        if (format === 'json') {
          return jsonDownload({ dataset: 'congressional_stock_trades', source: 'Capitol Trades', exported_at: new Date().toISOString(), records: data.length, data }, filename);
        }
        return csvDownload(Array.isArray(data) ? data : [data], filename);
      }

      default:
        return NextResponse.json({ error: 'Unknown export dataset' }, { status: 404 });
    }
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      { error: 'Failed to export data', details: String(error) },
      { status: 500 },
    );
  }
}
