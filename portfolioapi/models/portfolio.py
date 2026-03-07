from pydantic import BaseModel
from typing import Optional
from enum import Enum
from __future__ import Enum

class Position(BaseModel):
    symbol: str
    weight: float
    market_value: float
    quantity: Optional[float] = None
    currency: Optional[str] = "CAD"
    description: Optional[str] = None

class Portfolio(BaseModel):
    portfolio_value: float
    currency: str = "CAD"
    positions: list[Position]

# Questrade Input Token
class PortfolioInput(BaseModel):
    refresh_token: str

# Investor Survey

class RiskTolerance(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class InvestmentHorizon(str, Enum):
    SHORT = "short"       # < 3 years
    MEDIUM = "medium"     # 3–10 years
    LONG = "long"         # 10+ years

class InvestorSurvey(BaseModel):
    age: int
    risk_tolerance: RiskTolerance
    investment_horizon: InvestmentHorizon
    total_assets: float
    income: Optional[float] = None

class AnalysisRequest(BaseModel):
    portfolio: Portfolio
    inputs: InvestorSurvey

# Gemini Summary Response

class PortfolioSummary(BaseModel):
    investor_type: str          # Name of Investor
    summary: str                # 2–3 sentence overall read
    diversification: str
    sector_concentration: str
    geographic_exposure: str
    risk_assessment: str

# Garden Response
class PlantType(str, Enum):
    TRIM = "time_to_trim"           # dominant, oversized position
    WEED = "weed"                   # bad investment
    WILTING = "wilting"             # dropping, no DCA
    OVERWATERED = "overwatered"     # too much DCA
    DEAD = "dead_plant"             # unsalvageable
    HEALTHY = "healthy_flower"      # good

class PlantEntry(BaseModel):
    symbol: str
    plant_type: PlantType
    caption: str

class PortfolioGarden(BaseModel):
    plants: list[PlantEntry]        # max 20 entries, one per position

# --- Combined Response ---

class FullAnalysis(BaseModel):
    summary: PortfolioSummary
    garden: PortfolioGarden