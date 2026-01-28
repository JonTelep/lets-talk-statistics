"""
Let's Talk Statistics - Backend Services

This module contains all data fetching and processing services
for government data sources.
"""

from app.services.data_fetcher import FBIDataFetcher, DataFetcherError
from app.services.csv_processor import CSVProcessor
from app.services.statistics_calculator import StatisticsCalculator
from app.services.population_service import PopulationService

# NEW: Government data API services
from app.services.budget_service import USASpendingService, BudgetServiceError
from app.services.debt_service import TreasuryDebtService, DebtServiceError
from app.services.employment_service import BLSEmploymentService, EmploymentServiceError

__all__ = [
    # Crime data services (existing)
    "FBIDataFetcher",
    "DataFetcherError",
    "CSVProcessor",
    "StatisticsCalculator",
    "PopulationService",
    
    # Budget data (USASpending.gov)
    "USASpendingService",
    "BudgetServiceError",
    
    # National debt (Treasury)
    "TreasuryDebtService", 
    "DebtServiceError",
    
    # Employment data (BLS)
    "BLSEmploymentService",
    "EmploymentServiceError",
]
