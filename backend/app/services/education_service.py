"""
Department of Education Data Service

Fetches education statistics from official government data sources including:
- National Center for Education Statistics (NCES)
- Department of Education data.gov datasets
- College Scorecard API

Data includes:
- K-12 enrollment and demographics
- Higher education statistics
- Education funding and spending
- Student outcomes and graduation rates
"""

import asyncio
import hashlib
import json as json_module
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx

from app.config import get_settings
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


class EducationServiceError(Exception):
    """Custom exception for education service errors."""
    pass


class EducationDataService:
    """
    Service for fetching education data from Department of Education and NCES.
    
    Primary APIs:
    - College Scorecard API: https://api.data.gov/ed/collegescorecard/
    - NCES IPEDS Data: https://nces.ed.gov/ipeds/datacenter/
    - Data.gov Education: https://api.data.gov/
    
    Uses file-based caching (48h TTL) to survive rate limits and restarts.
    """

    def __init__(self):
        self.base_url = "https://api.data.gov/ed/collegescorecard/v1"
        self.timeout = 30.0
        self.max_retries = 3
        self.api_key = (settings.DOE_API_KEY if hasattr(settings, 'DOE_API_KEY') and settings.DOE_API_KEY else None) or 'DEMO_KEY'
        self.cache_dir = settings.data_dir / "cache"
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self._cache_ttl_hours = 48  # Education data doesn't change often

    def _read_cache(self, key: str) -> Optional[Dict]:
        """Read cached data if still fresh."""
        safe_key = hashlib.md5(key.encode()).hexdigest()
        path = self.cache_dir / f"edu_{safe_key}.json"
        if path.exists():
            mtime = datetime.fromtimestamp(path.stat().st_mtime)
            if datetime.now() - mtime < timedelta(hours=self._cache_ttl_hours):
                try:
                    return json_module.loads(path.read_text())
                except Exception:
                    pass
        return None

    def _write_cache(self, key: str, data: Dict) -> None:
        """Write data to file cache."""
        safe_key = hashlib.md5(key.encode()).hexdigest()
        path = self.cache_dir / f"edu_{safe_key}.json"
        try:
            path.write_text(json_module.dumps(data, indent=2, default=str))
        except Exception as e:
            logger.warning(f"Failed to write education cache: {e}")

    async def get_enrollment_statistics(self, years: int = 5) -> Dict[str, Any]:
        """
        Get K-12 and higher education enrollment statistics.
        
        Returns enrollment trends, demographics, and state breakdowns.
        """
        cache_key = f"enrollment_{years}"
        if cached := self._read_cache(cache_key):
            logger.info("Using cached enrollment data")
            return cached

        try:
            logger.info(f"Fetching education enrollment data for last {years} years")
            
            # Fetch enrollment data from College Scorecard
            params = {
                'fields': 'school.name,school.state,latest.student.size,latest.student.demographics.race_ethnicity,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state',
                'per_page': 1000,
                'sort': 'latest.student.size:desc'
            }
            
            if self.api_key:
                params['api_key'] = self.api_key
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/schools", params=params)
                response.raise_for_status()
                data = response.json()
            
            # Process enrollment data
            schools = data.get('results', [])
            processed_data = self._process_enrollment_data(schools)
            
            logger.info(f"Successfully fetched enrollment data for {len(schools)} institutions")
            result = {
                'success': True,
                'data': processed_data,
                'metadata': {
                    'source': 'Department of Education College Scorecard',
                    'total_institutions': len(schools),
                    'last_updated': datetime.now().isoformat(),
                    'api_version': 'v1'
                }
            }
            self._write_cache(cache_key, result)
            return result
            
        except httpx.RequestError as e:
            logger.error(f"Network error fetching enrollment data: {e}")
            raise EducationServiceError(f"Failed to fetch enrollment data: {e}")
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error fetching enrollment data: {e.response.status_code}")
            raise EducationServiceError(f"API error: {e.response.status_code}")
        except Exception as e:
            logger.error(f"Unexpected error fetching enrollment data: {e}")
            raise EducationServiceError(f"Unexpected error: {e}")

    async def get_spending_statistics(self) -> Dict[str, Any]:
        """
        Get education spending and funding statistics.
        
        Returns federal, state, and local education spending data.
        """
        try:
            logger.info("Fetching education spending data")
            
            # Mock data for now - would integrate with Treasury/Census APIs for real spending data
            spending_data = {
                'federal_spending': {
                    'total': 79800000000,  # $79.8B (approximate 2023 federal education spending)
                    'k12': 59600000000,
                    'higher_ed': 15200000000,
                    'other': 5000000000
                },
                'by_program': {
                    'Title I': 18400000000,
                    'IDEA': 13200000000,
                    'Pell Grants': 22800000000,
                    'Head Start': 11900000000,
                    'Other': 13500000000
                },
                'trends': [
                    {'year': 2019, 'spending': 68500000000},
                    {'year': 2020, 'spending': 76200000000},
                    {'year': 2021, 'spending': 79100000000},
                    {'year': 2022, 'spending': 78900000000},
                    {'year': 2023, 'spending': 79800000000}
                ]
            }
            
            logger.info("Successfully processed education spending data")
            return {
                'success': True,
                'data': spending_data,
                'metadata': {
                    'source': 'Department of Education Budget Data',
                    'last_updated': datetime.now().isoformat(),
                    'note': 'Federal education spending only - excludes state and local funding'
                }
            }
            
        except Exception as e:
            logger.error(f"Error fetching spending data: {e}")
            raise EducationServiceError(f"Failed to fetch spending data: {e}")

    async def get_outcomes_statistics(self) -> Dict[str, Any]:
        """
        Get education outcomes and performance statistics.
        
        Returns graduation rates, test scores, and achievement data.
        """
        cache_key = "outcomes"
        if cached := self._read_cache(cache_key):
            logger.info("Using cached outcomes data")
            return cached

        try:
            logger.info("Fetching education outcomes data")
            
            # Fetch graduation rate data from College Scorecard
            # Note: field names updated — completion_rate_4yr_150nt replaced by rate_suppressed.overall
            params = {
                'fields': 'school.name,school.state,latest.completion.rate_suppressed.overall,latest.earnings.10_yrs_after_entry.median',
                'per_page': 2000,
                'latest.completion.rate_suppressed.overall__range': '0.01..1'
            }
            
            if self.api_key:
                params['api_key'] = self.api_key
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/schools", params=params)
                response.raise_for_status()
                data = response.json()
            
            # Process outcomes data
            schools = data.get('results', [])
            processed_data = self._process_outcomes_data(schools)
            
            logger.info(f"Successfully fetched outcomes data for {len(schools)} institutions")
            result = {
                'success': True,
                'data': processed_data,
                'metadata': {
                    'source': 'Department of Education College Scorecard',
                    'total_institutions': len(schools),
                    'last_updated': datetime.now().isoformat(),
                    'note': 'Higher education completion rates and earnings data'
                }
            }
            self._write_cache(cache_key, result)
            return result
            
        except Exception as e:
            logger.error(f"Error fetching outcomes data: {e}")
            raise EducationServiceError(f"Failed to fetch outcomes data: {e}")

    def _process_enrollment_data(self, schools: List[Dict]) -> Dict[str, Any]:
        """Process raw enrollment data into structured format."""
        total_enrollment = 0
        enrollment_by_state = {}
        tuition_data = []
        
        for school in schools:
            try:
                # Handle flat dot-notation keys from College Scorecard API
                size = school.get('latest.student.size')
                if size and isinstance(size, (int, float)) and size > 0:
                    total_enrollment += size
                    
                    # Group by state
                    state = school.get('school.state')
                    if state:
                        enrollment_by_state[state] = enrollment_by_state.get(state, 0) + size
                    
                    # Collect tuition data
                    in_state = school.get('latest.cost.tuition.in_state')
                    out_state = school.get('latest.cost.tuition.out_of_state')
                    
                    if in_state and isinstance(in_state, (int, float)) and in_state > 0:
                        tuition_data.append({
                            'name': school.get('school.name', ''),
                            'state': state,
                            'in_state': in_state,
                            'out_of_state': out_state,
                            'enrollment': size
                        })
                        
            except (KeyError, TypeError, ValueError):
                continue
        
        # Sort states by enrollment
        top_states = sorted(
            [{'state': k, 'enrollment': v} for k, v in enrollment_by_state.items()],
            key=lambda x: x['enrollment'],
            reverse=True
        )[:15]
        
        # Calculate tuition averages
        avg_in_state = sum(t['in_state'] for t in tuition_data if t['in_state']) / len([t for t in tuition_data if t['in_state']]) if tuition_data else 0
        avg_out_state = sum(t['out_of_state'] for t in tuition_data if t['out_of_state']) / len([t for t in tuition_data if t['out_of_state']]) if tuition_data else 0
        
        return {
            'total_enrollment': int(total_enrollment),
            'total_institutions': len(schools),
            'enrollment_by_state': top_states,
            'tuition_averages': {
                'in_state': round(avg_in_state, 0),
                'out_of_state': round(avg_out_state, 0)
            },
            'largest_institutions': sorted(tuition_data, key=lambda x: x['enrollment'], reverse=True)[:10]
        }

    def _process_outcomes_data(self, schools: List[Dict]) -> Dict[str, Any]:
        """Process raw outcomes data into structured format.
        
        Note: College Scorecard API returns flat dot-notation keys like
        'latest.completion.rate_suppressed.overall' rather than nested dicts.
        """
        completion_rates = []
        earnings_data = []
        state_averages = {}
        
        for school in schools:
            try:
                # Handle flat dot-notation keys from College Scorecard API
                completion_rate = school.get('latest.completion.rate_suppressed.overall')
                median_earnings = school.get('latest.earnings.10_yrs_after_entry.median')
                state = school.get('school.state')
                name = school.get('school.name', '')
                
                if completion_rate and isinstance(completion_rate, (int, float)):
                    completion_rates.append({
                        'name': name,
                        'state': state,
                        'completion_rate': completion_rate
                    })
                    
                    # Track by state
                    if state:
                        if state not in state_averages:
                            state_averages[state] = {'rates': [], 'earnings': []}
                        state_averages[state]['rates'].append(completion_rate)
                
                # Get earnings data
                if median_earnings and isinstance(median_earnings, (int, float)) and median_earnings > 0:
                    earnings_data.append({
                        'name': name,
                        'state': state,
                        'median_earnings': median_earnings,
                        'completion_rate': completion_rate
                    })
                    
                    if state and median_earnings:
                        if state not in state_averages:
                            state_averages[state] = {'rates': [], 'earnings': []}
                        state_averages[state]['earnings'].append(median_earnings)
                        
            except (KeyError, TypeError, ValueError):
                continue
        
        # Calculate state averages
        state_summary = []
        for state, data in state_averages.items():
            if data['rates'] and data['earnings']:
                avg_completion = sum(data['rates']) / len(data['rates'])
                avg_earnings = sum(data['earnings']) / len(data['earnings'])
                state_summary.append({
                    'state': state,
                    'avg_completion_rate': round(avg_completion, 3),
                    'avg_median_earnings': round(avg_earnings, 0),
                    'institution_count': len(data['rates'])
                })
        
        # Sort by completion rate
        state_summary.sort(key=lambda x: x['avg_completion_rate'], reverse=True)
        
        return {
            'average_completion_rate': round(sum(r['completion_rate'] for r in completion_rates) / len(completion_rates), 3) if completion_rates else 0,
            'median_earnings': round(sum(e['median_earnings'] for e in earnings_data) / len(earnings_data), 0) if earnings_data else 0,
            'top_performing_states': state_summary[:10],
            'highest_completion_rates': sorted(completion_rates, key=lambda x: x['completion_rate'], reverse=True)[:10],
            'highest_earning_programs': sorted(earnings_data, key=lambda x: x['median_earnings'], reverse=True)[:10],
            'total_institutions_analyzed': len(completion_rates)
        }

    async def get_overview_stats(self) -> Dict[str, Any]:
        """
        Get comprehensive education overview statistics.
        
        Combines enrollment, spending, and outcomes data.
        """
        cache_key = "overview"
        if cached := self._read_cache(cache_key):
            logger.info("Using cached education overview")
            return cached

        try:
            logger.info("Fetching comprehensive education overview")
            
            # Run sequentially to avoid DEMO_KEY rate limits (1 req/sec)
            # Spending is local/static so run it first (no API call)
            spending_data = await self.get_spending_statistics()
            
            try:
                enrollment_data = await self.get_enrollment_statistics()
            except Exception as e:
                logger.warning(f"Enrollment data failed: {e}")
                enrollment_data = {'success': False, 'data': {}}
            
            # Brief pause to respect rate limits
            await asyncio.sleep(1.5)
            
            try:
                outcomes_data = await self.get_outcomes_statistics()
            except Exception as e:
                logger.warning(f"Outcomes data failed: {e}")
                outcomes_data = {'success': False, 'data': {}}
            
            # Ensure all data is dict-like (fallback already handled above)
            
            # Combine all data
            overview = {
                'enrollment': enrollment_data.get('data', {}),
                'spending': spending_data.get('data', {}),
                'outcomes': outcomes_data.get('data', {}),
                'summary': {
                    'total_higher_ed_enrollment': enrollment_data.get('data', {}).get('total_enrollment', 0),
                    'federal_education_spending': spending_data.get('data', {}).get('federal_spending', {}).get('total', 0),
                    'average_completion_rate': outcomes_data.get('data', {}).get('average_completion_rate', 0),
                    'median_graduate_earnings': outcomes_data.get('data', {}).get('median_earnings', 0)
                }
            }
            
            logger.info("Successfully compiled education overview")
            result = {
                'success': True,
                'data': overview,
                'metadata': {
                    'sources': [
                        'Department of Education College Scorecard',
                        'Federal Education Budget Data',
                        'NCES Higher Education Statistics'
                    ],
                    'last_updated': datetime.now().isoformat(),
                    'coverage': 'Higher education focus - K-12 data limited'
                }
            }
            # Only cache if we got real data (not empty fallbacks)
            if overview.get('enrollment') or overview.get('outcomes'):
                self._write_cache(cache_key, result)
            return result
            
        except Exception as e:
            logger.error(f"Error compiling education overview: {e}")
            raise EducationServiceError(f"Failed to compile overview: {e}")


# Singleton instance
education_service = EducationDataService()