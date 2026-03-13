import httpx
import json
from models.portfolio import (
    Portfolio, InvestorSurvey,
    FullAnalysis, PortfolioSummary, PortfolioGarden, PlantEntry
)
from core.config import settings
import asyncio


GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

PLANT_TYPES = {
    "time_to_trim": "dominant position towering over the rest, crowding out diversity",
    "weed": "bad investment consuming resources and offering nothing back",
    "wilting": "slowly dropping stock that hasn't been DCA'd (watered)",
    "overwatered": "over-DCA'd stock that needs to breathe",
    "dead_plant": "unsalvageable position — time to sell and move on",
    "healthy_flower": "strong, well-maintained position performing well",
}

INVESTOR_TYPE = {
    "hoarder": "The seed hoarder which has too much cash and not enough investments",
    "negligent": "The negligent gardener who has not watered or trimmed their garden",
    "healthy": "The healthy gardener who has a balanced, healthy portfolio",
    "experimental": "The experimental gardener who is invested heavy into speculative stocks",
    "overwaterer": "The overwaterer who has too much invested in their top five stock holdings",
}

SUMMARY_PROMPT = """
You are an insightful, friendly financial analyst.
Given a portfolio and an investor profile, return ONLY a valid JSON object — no markdown, no backticks.

Investor Profile:
{survey}

Portfolio:
{portfolio}

Investor Types and their meanings:
{investor_types}

Return this exact JSON shape:
{{
  "investor_type": "one of: hoarder | negligent | healthy | experimental | overwaterer",
  "summary": "2-3 sentences describing this investor and their portfolio overall",
  "diversification": "1-2 sentences on diversification quality",
  "sector_concentration": "1-2 sentences on sector concentration risk",
  "geographic_exposure": "1-2 sentences on geographic spread",
  "risk_assessment": "1-2 sentences on overall risk given their profile"
}}
"""


GARDEN_PROMPT = """
You are a creative financial storyteller. Each stock in a portfolio is a plant in a garden.

Plant types and their meanings:
{plant_types}

Given this portfolio, assign each position a plant_type and write a caption of ~20 words in the voice of a gardener.
Return ONLY a valid JSON object — no markdown, no backticks.

Portfolio (max 10 positions shown):
{portfolio}

Return this exact JSON shape:
{{
  "plants": [
    {{
      "symbol": "TICKER",
      "plant_type": "one of: time_to_trim | weed | wilting | overwatered | dead_plant | healthy_flower",
      "caption": "~20 word flavour text describing this plant"
    }}
  ]
}}"""

class AnalysisService:
    async def analyze(self, portfolio: Portfolio, survey: InvestorSurvey) -> FullAnalysis:
        # For concurrent

        # summary, garden = await asyncio.gather(
        #     self._get_summary(portfolio, survey),
        #     self._get_garden(portfolio)
        # )
        
        # For limits
        summary = await self._get_summary(portfolio, survey)
        await asyncio.sleep(4)
        garden = await self._get_garden(portfolio)
        return FullAnalysis(summary=summary, garden=garden)
    
    async def _get_summary(self, portfolio: Portfolio, survey: InvestorSurvey) -> PortfolioSummary:
        investor_type_descriptions = "\n".join(
            f" {k}: {v}" for k, v in INVESTOR_TYPE.items()
        )
        # Locks to 15 stocks in portfolio
        trimmed = portfolio.model_dump()
        trimmed["positions"] = trimmed["positions"][:15]

        prompt = SUMMARY_PROMPT.format(
            survey=json.dumps(survey.model_dump(), indent=2),
            portfolio=json.dumps(trimmed, indent=2),
            investor_types=investor_type_descriptions,
        )
        raw = await self._call_gemini(prompt)
        return PortfolioSummary(**raw)
    
    async def _get_garden(self, portfolio: Portfolio) -> PortfolioGarden:
        # Cap to 15 flowers
        trimmed = portfolio.model_dump()
        trimmed["positions"] = trimmed["positions"][:15]

        plant_type_descriptions = "\n".join(
            f" {k}: {v}" for k, v in PLANT_TYPES.items()
        )
        prompt = GARDEN_PROMPT.format(
            plant_types=plant_type_descriptions,
            portfolio=json.dumps(trimmed, indent=2)
        )
        raw = await self._call_gemini(prompt)
        plants = [PlantEntry(**p) for p in raw["plants"]]
        return PortfolioGarden(plants=plants)
    
    async def _call_gemini(self, prompt: str) -> dict:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                GEMINI_URL,
                params={"key": settings.gemini_api_key},
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.8, 
                        "maxOutputTokens": 4096, 
                        "response_mime_type": "application/json" 
                    },
                    
                },
            )
            response.raise_for_status()
        
        raw_text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
        # print("RAW GEMINI RESPONSE:", raw_text)
        # cleaned = raw_text.strip().removeprefix("```json").removesuffix("```").strip()

        
        return json.loads(raw_text)
    