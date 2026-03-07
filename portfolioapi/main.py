from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from controllers.PortfolioController import router as portfolio_router
from controllers.AnalysisController import router as analysis_router

app = FastAPI(title="ClementineAPI", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Update for live
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(portfolio_router)
app.include_router(analysis_router)

@app.get("/")
def root():
    return {"status": "ok"}