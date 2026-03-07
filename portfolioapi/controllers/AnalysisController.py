from fastapi import APIRouter, HTTPException
from models.portfolio import AnalysisRequest, FullAnalysis 
from services.AnalysisService import AnalysisService
import httpx

router = APIRouter(prefix="/analysis", tags=["analysis"])
analysis_service = AnalysisService()

@router.post("", response_model=FullAnalysis)
async def analyze_portfolio(body: AnalysisRequest):
    try:
        return await analysis_service.analyze(body.portfolio, body.inputs)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            print("GEMINI RATE LIMIT HIT - Returning Mock Data for Frontend Dev")
            # Return a valid mock response so your frontend doesn't break
            return {
              "summary": {
                "investor_type": "Aggressive Growth Investor",
                "summary": "You have a high risk tolerance and a tech-heavy portfolio.",
                "diversification": "Needs work. You are heavily concentrated.",
                "sector_concentration": "High risk in the technology sector.",
                "geographic_exposure": "Almost entirely US markets.",
                "risk_assessment": "High risk, but suitable for your age and horizon."
              },
              "garden": {
                "plants": [
                  {
                    "symbol": "VOO",
                    "plant_type": "healthy_flower",
                    "caption": "A strong, resilient oak tree anchoring your garden."
                  },
                  {
                    "symbol": "TSLA",
                    "plant_type": "weed",
                    "caption": "Growing wild and unpredictable, consuming a lot of attention."
                  }
                ]
              }
            }
        # If it's a different HTTP error, raise it normally
        raise HTTPException(status_code=502, detail=f"Gemini API error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Analysis error: {str(e)}")