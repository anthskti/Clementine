from fastapi import APIRouter, HTTPException
from models.portfolio import AnalysisRequest, FullAnalysis 
from services.AnalysisService import AnalysisService

router = APIRouter(prefix="/analysis", tags=["analysis"])
analysis_service = AnalysisService()

@router.post("", response_model=FullAnalysis)
async def analyze_portfolio(body: AnalysisRequest):
    """Send portfolio + survey to Gemini. Returns summary and plant garden."""
    try:
        return await analysis_service(body.portfolio, body.survey)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Analysis error: {str(e)}")
