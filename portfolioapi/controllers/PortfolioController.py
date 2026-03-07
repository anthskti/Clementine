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
        "portfolio_value": 8200,
        "currency": "CAD",
        "positions": [
            {"symbol": "VOO", "weight": 0.55, "market_value": 4510},
            {"symbol": "AAPL", "weight": 0.27, "market_value": 2214},
            {"symbol": "NVDA", "weight": 0.18, "market_value": 1476},
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