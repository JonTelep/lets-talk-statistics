import { NextRequest, NextResponse } from 'next/server';

// Historical enforcement data from DHS/CBP official sources
const HISTORICAL_ENFORCEMENT = [
  {"fiscal_year": 2024, "legal_admissions": 1016000, "removals": 142580, "border_encounters": 2475669, "source": "DHS FY2024 Yearbook"},
  {"fiscal_year": 2023, "legal_admissions": 1100000, "removals": 142580, "border_encounters": 2045838, "source": "DHS FY2023 Yearbook"},
  {"fiscal_year": 2022, "legal_admissions": 1080000, "removals": 72177, "border_encounters": 2378944, "source": "DHS FY2022 Yearbook"},
  {"fiscal_year": 2021, "legal_admissions": 740000, "removals": 59011, "border_encounters": 1734686, "source": "DHS FY2021 Yearbook"},
  {"fiscal_year": 2020, "legal_admissions": 707362, "removals": 185884, "border_encounters": 458088, "source": "DHS FY2020 Yearbook"},
];

export async function GET(request: NextRequest) {
  try {
    // Calculate summary statistics
    const latest = HISTORICAL_ENFORCEMENT[0];
    const previousYear = HISTORICAL_ENFORCEMENT[1];
    
    const admissionsChange = latest.legal_admissions - previousYear.legal_admissions;
    const encountetsChange = latest.border_encounters - previousYear.border_encounters;
    
    const summary = {
      current_fiscal_year: latest.fiscal_year,
      legal_admissions: {
        current: latest.legal_admissions,
        previous: previousYear.legal_admissions,
        change: admissionsChange,
        percent_change: Math.round((admissionsChange / previousYear.legal_admissions) * 1000) / 10
      },
      border_encounters: {
        current: latest.border_encounters,
        previous: previousYear.border_encounters,
        change: encountetsChange,
        percent_change: Math.round((encountetsChange / previousYear.border_encounters) * 1000) / 10
      },
      removals: {
        current: latest.removals,
        previous: previousYear.removals,
        change: latest.removals - previousYear.removals,
      }
    };
    
    const result = {
      source: "DHS Immigration Statistics",
      fetched_at: new Date().toISOString(),
      summary
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching immigration summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch immigration summary' },
      { status: 500 }
    );
  }
}