from pydantic import BaseModel
from typing import Optional

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

# User Survey at the beginning
class SurveyInput(BaseModel):
    age: int
    risk: str
    investment_idelogy: str 
    total_asset: float # percentage of total invested into account

class AnalysisRequest(BaseModel):
    portfolio: Portfolio
    inputs: SurveyInput