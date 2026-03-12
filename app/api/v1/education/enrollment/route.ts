import { NextRequest, NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/gov-api';

const COLLEGE_SCORECARD_BASE = "https://api.data.gov/ed/collegescorecard/v1";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const years = parseInt(searchParams.get('years') || '5');
    
    // College Scorecard API for enrollment data
    const params = new URLSearchParams({
      'fields': 'school.name,school.state,latest.student.size,latest.student.demographics.race_ethnicity.white,latest.student.demographics.race_ethnicity.black,latest.student.demographics.race_ethnicity.hispanic,latest.student.demographics.race_ethnicity.asian',
      'per_page': '1000',
      'sort': 'latest.student.size:desc'
    });
    
    const doeApiKey = process.env.DOE_API_KEY;
    if (doeApiKey) {
      params.append('api_key', doeApiKey);
    }
    
    const url = `${COLLEGE_SCORECARD_BASE}/schools`;
    const data = await fetchWithCache(`${url}?${params}`);
    
    const schools = data.results || [];
    
    // Process enrollment data
    const enrollmentData = schools
      .filter((school: any) => school.latest?.student?.size && school.latest.student.size > 0)
      .map((school: any) => ({
        name: school.school?.name || "Unknown",
        state: school.school?.state || "Unknown",
        total_enrollment: school.latest?.student?.size || 0,
        demographics: {
          white: school.latest?.student?.demographics?.race_ethnicity?.white || 0,
          black: school.latest?.student?.demographics?.race_ethnicity?.black || 0,
          hispanic: school.latest?.student?.demographics?.race_ethnicity?.hispanic || 0,
          asian: school.latest?.student?.demographics?.race_ethnicity?.asian || 0
        }
      }));
    
    // Calculate aggregate statistics
    const totalEnrollment = enrollmentData.reduce((sum: number, school: any) => sum + school.total_enrollment, 0);
    
    const aggregateDemographics = enrollmentData.reduce((acc: any, school: any) => {
      const total = school.total_enrollment;
      acc.white += (school.demographics.white * total) || 0;
      acc.black += (school.demographics.black * total) || 0;
      acc.hispanic += (school.demographics.hispanic * total) || 0;
      acc.asian += (school.demographics.asian * total) || 0;
      return acc;
    }, { white: 0, black: 0, hispanic: 0, asian: 0 });
    
    // Convert to percentages
    Object.keys(aggregateDemographics).forEach(key => {
      aggregateDemographics[key as keyof typeof aggregateDemographics] = 
        Math.round((aggregateDemographics[key as keyof typeof aggregateDemographics] / totalEnrollment) * 1000) / 10;
    });
    
    const result = {
      source: "Department of Education College Scorecard",
      fetched_at: new Date().toISOString(),
      summary: {
        total_institutions: enrollmentData.length,
        total_enrollment: totalEnrollment,
        avg_enrollment_per_institution: Math.round(totalEnrollment / enrollmentData.length),
        demographic_percentages: aggregateDemographics
      },
      largest_institutions: enrollmentData
        .sort((a: any, b: any) => b.total_enrollment - a.total_enrollment)
        .slice(0, 20),
      enrollment_by_state: Object.entries(
        enrollmentData.reduce((acc: Record<string, number>, school: any) => {
          acc[school.state] = (acc[school.state] || 0) + school.total_enrollment;
          return acc;
        }, {})
      )
        .map(([state, enrollment]) => ({ state, enrollment }))
        .sort((a: any, b: any) => b.enrollment - a.enrollment)
        .slice(0, 15)
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching enrollment data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollment data' },
      { status: 500 }
    );
  }
}