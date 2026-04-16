from fastapi import APIRouter, HTTPException, UploadFile, File
from models.portfolio import Portfolio, PortfolioInput, ManualPortfolioInput
from services.PortfolioService import PortfolioService
from services.CSVService import CSVService

import yfinance as yf

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

@router.post("/manual", response_model=Portfolio)
async def add_manual_portfolio(body: ManualPortfolioInput):
    """Manual user input, fetches live prices, and builds the portfolio."""
    tickers = " ".join([p.symbol for p in body.positions])
    live_data = yf.download(tickers, period="1d", group_by="ticker")

    rows = []
    for p in body.positions:
        symbol = p.symbol.upper()

        try:
            if len(body.positions) == 1:
                current_price = float(live_data['Close'].iloc[-1])
            else:
                current_price = float(live_data[symbol]['Close'].iloc[-1])
        except Exception:
            raise HTTPException(status_code=400, detail=f"Could not fetch price for {symbol}")
        
        rows.append({
            "symbol": symbol,
            "price": current_price,
            "quantity": p.quantity,
            "avg_cost_per_share": p.avg_cost
        })

    return portfolio_service.build_from_yahoo_minimal(rows)

# Mock data — minimal Yahoo-style rows; weight and total_gain_pct are derived
@router.post("/mock", response_model=Portfolio)
async def add_mock_portfolio():
    """Return a hardcoded mock portfolio for development and demos."""
    rows = [
        {"symbol": "HNST", "price": 2.93, "quantity": 50, "avg_cost_per_share": 2.73},
        {"symbol": "ONDS", "price": 9.83, "quantity": 10, "avg_cost_per_share": 9.525},
        {"symbol": "COP-U.TO", "price": 11.12, "quantity": 15, "avg_cost_per_share": 11.74},
        {"symbol": "LUNR", "price": 17.63, "quantity": 25, "avg_cost_per_share": 10.783796},
        {"symbol": "AMZN.NE", "price": 24.64, "quantity": 60, "avg_cost_per_share": 16.5},
        {"symbol": "VISA.NE", "price": 29.13, "quantity": 20, "avg_cost_per_share": 23.25},
        {"symbol": "FBTC.TO", "price": 30.5, "quantity": 22, "avg_cost_per_share": 43.53909091},
        {"symbol": "META.NE", "price": 34.67, "quantity": 15, "avg_cost_per_share": 36.32},
        {"symbol": "MDA.TO", "price": 40.43, "quantity": 5, "avg_cost_per_share": 27.34},
        {"symbol": "GOOG.NE", "price": 48.04, "quantity": 25, "avg_cost_per_share": 31.426},
        {"symbol": "WMT.NE", "price": 52.16, "quantity": 16, "avg_cost_per_share": 24.23},
        {"symbol": "L.TO", "price": 62.29, "quantity": 10, "avg_cost_per_share": 64.84},
        {"symbol": "XUU.TO", "price": 66.94, "quantity": 42, "avg_cost_per_share": 61.36},
        {"symbol": "VXC.TO", "price": 73.27, "quantity": 32, "avg_cost_per_share": 67.4759375},
        {"symbol": "ENB.TO", "price": 73.47, "quantity": 7, "avg_cost_per_share": 66.31571429},
        {"symbol": "ASTS", "price": 89.475, "quantity": 10, "avg_cost_per_share": 34.72},
        {"symbol": "DUOL", "price": 101.92, "quantity": 2, "avg_cost_per_share": 171.21875},
        {"symbol": "NLR", "price": 136.01, "quantity": 2, "avg_cost_per_share": 144.67},
        {"symbol": "DOL.TO", "price": 193.63, "quantity": 3, "avg_cost_per_share": 185.62},
        {"symbol": "MSFT", "price": 408.96, "quantity": 1, "avg_cost_per_share": 427.42999},
    ]
    return portfolio_service.build_from_yahoo_minimal(rows)

# CSV 
@router.post("/csv", response_model=Portfolio)
async def add_portfolio_from_csv(file: UploadFile = File(...)):
    """Parse an uploaded CSV file into a portfolio."""
    contents = await file.read()
    try:
        return await csv_service.parse_upload(contents)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))