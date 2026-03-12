import { NextRequest, NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/gov-api';

const COLLEGE_SCORECARD_BASE = "https://api.data.gov/ed/collegescorecard/v1";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    
    // College Scorecard API
    const params = new URLSearchParams({
      'fields': 'school.name,school.state,latest.student.size,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state,latest.academics.program_available.assoc,latest.academics.program_available.bachelors',
      'per_page': limit.toString(),
      'sort': 'latest.student.size:desc'
    });
    
    const doeApiKey = process.env.DOE_API_KEY;
    if (doeApiKey) {
      params.append('api_key', doeApiKey);
    }
    
    const url = `${COLLEGE_SCORECARD_BASE}/schools`;
    const data = await fetchWithCache(`${url}?${params}`);
    
    const schools = data.results || [];
    
    // Process and summarize the data
    const processedData = schools
      .filter((school: any) => school.latest?.student?.size && school.latest.student.size > 0)
      .map((school: any) => ({
        name: school.school?.name || "Unknown",
        state: school.school?.state || "Unknown",
        enrollment: school.latest?.student?.size || 0,
        tuition_in_state: school.latest?.cost?.tuition?.in_state || null,
        tuition_out_state: school.latest?.cost?.tuition?.out_of_state || null,
        offers_associates: school.latest?.academics?.program_available?.assoc || false,
        offers_bachelors: school.latest?.academics?.program_available?.bachelors || false
      }))
      .slice(0, limit);
    
    // Calculate summary statistics
    const totalEnrollment = processedData.reduce((sum: number, school: any) => sum + (school.enrollment || 0), 0);
    const avgTuitionInState = processedData
      .filter((s: any) => s.tuition_in_state !== null)
      .reduce((sum: number, school: any, _: any, arr: any[]) => sum + (school.tuition_in_state! / arr.length), 0);
    
    const stateBreakdown = processedData.reduce((acc: Record<string, number>, school: any) => {
      acc[school.state] = (acc[school.state] || 0) + 1;
      return acc;
    }, {});
    
    const result = {
      source: "Department of Education College Scorecard",
      fetched_at: new Date().toISOString(),
      summary: {
        institutions_shown: processedData.length,
        total_enrollment: totalEnrollment,
        avg_tuition_in_state: Math.round(avgTuitionInState),
        states_represented: Object.keys(stateBreakdown).length
      },
      state_breakdown: Object.entries(stateBreakdown)
        .map(([state, count]) => ({ state, institutions: count }))
        .sort((a: any, b: any) => b.institutions - a.institutions)
        .slice(0, 10), // Top 10 states
      institutions: processedData
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching education data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch education data' },
      { status: 500 }
    );
  }
}