from fastapi import APIRouter, HTTPException, UploadFile, File
from models.portfolio import Portfolio, PortfolioInput
from services.PortfolioService import PortfolioService
from services.CSVService import CSVService

router = APIRouter(prefix="/portfolio", tags=["portfolio"])
portfolio_service = PortfolioService()
csv_service = CSVService()


@router.post("", response_model=Portfolio)
async def add_portfolio(body: PortfolioInput):
    """Exchange Questrade refresh token and return normalized portfolio."""
    try:
        portfolio = await portfolio_service.build_from_questrade(body.refresh_token)
        return portfolio
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Questrade API error: {str(e)}")

# Mock data
@router.post("/mock", response_model=Portfolio)
async def add_mock_portfolio():
    """Return a hardcoded mock portfolio for development and demos."""
    mock = {
    "portfolio_value": 15934.69,
    "currency": "CAD",
    "positions": [
        {"symbol": "HNST", "weight": 0.0125, "market_value": 198.76},
        {"symbol": "ONDS", "weight": 0.0084, "market_value": 133.36},
        {"symbol": "COP-U.TO", "weight": 0.0142, "market_value": 226.30},
        {"symbol": "LUNR", "weight": 0.0375, "market_value": 597.97},
        {"symbol": "AMZN.NE", "weight": 0.0928, "market_value": 1478.40},
        {"symbol": "VISA.NE", "weight": 0.0366, "market_value": 582.60},
        {"symbol": "FBTC.TO", "weight": 0.0421, "market_value": 671.00},
        {"symbol": "META.NE", "weight": 0.0326, "market_value": 520.05},
        {"symbol": "MDA.TO", "weight": 0.0127, "market_value": 202.15},
        {"symbol": "GOOG.NE", "weight": 0.0754, "market_value": 1201.00},
        {"symbol": "WMT.NE", "weight": 0.0524, "market_value": 834.56},
        {"symbol": "L.TO", "weight": 0.0391, "market_value": 622.90},
        {"symbol": "XUU.TO", "weight": 0.1764, "market_value": 2811.48},
        {"symbol": "VXC.TO", "weight": 0.1471, "market_value": 2344.64},
        {"symbol": "ENB.TO", "weight": 0.0323, "market_value": 514.29},
        {"symbol": "ASTS", "weight": 0.0762, "market_value": 1213.91},
        {"symbol": "DUOL", "weight": 0.0174, "market_value": 276.55},
        {"symbol": "NLR", "weight": 0.0232, "market_value": 369.05},
        {"symbol": "DOL.TO", "weight": 0.0365, "market_value": 580.89},
        {"symbol": "MSFT", "weight": 0.0348, "market_value": 554.84},
    ],
}
    return await portfolio_service.build_from_dict(mock)

# CSV 
@router.post("/csv", response_model=Portfolio)
async def add_portfolio_from_csv(file: UploadFile = File(...)):
    """Parse an uploaded CSV file into a portfolio."""
    contents = await file.read()
    try:
        return await csv_service.parse(contents.decode("utf-8"))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))