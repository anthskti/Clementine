import httpx
import json
import re
from models.portfolio import (
    Portfolio,
    Position,
    InvestorSurvey,
    FullAnalysis,
    PortfolioSummary,
    PortfolioGarden,
    PlantEntry,
)
from core.config import settings
import asyncio


GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

# Cap positions sent to the model (input size + garden output size both scale with this).
LLM_MAX_POSITIONS = 15
# Garden JSON can be large (many captions); avoid truncating before valid JSON closes.
GEMINI_MAX_OUTPUT_TOKENS = 8192
GEMINI_TIMEOUT_SEC = 120

PLANT_TYPES = {
    "time_to_trim": "Too large and hurting diversification",
    "weed": "Poor risk/reward",
    "wilting": "Weak, not added to (DCA)",
    "overwatered": "Over-accumulated / needs trimming",
    "dead_plant": "Likely exit candidate",
    "healthy_flower": "Solid holding",
}

INVESTOR_TYPE = {
    "hoarder": "Too much cash, not enough invested",
    "negligent": "Portfolio neglected",
    "healthy": "Balanced, appropriate risk",
    "experimental": "Heavy speculative exposure",
    "overwaterer": "Too much in top few names",
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

Portfolio (JSON, largest positions by weight first):
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


def _portfolio_json_for_llm(portfolio: Portfolio, max_positions: int = LLM_MAX_POSITIONS) -> str:
    """
    Minimize tokens to Gemini: no indentation, rounded numbers, only fields useful
    for narrative analysis (see docs/analysis-llm-payload.md).
    """

    def _pos(p: Position) -> dict:
        out: dict = {
            "symbol": p.symbol,
            "weight": round(p.weight, 4),
        }
        if p.price is not None:
            out["price"] = round(p.price, 4)
        if p.avg_cost_per_share is not None:
            out["avg_cost"] = round(p.avg_cost_per_share, 4)
        if p.total_gain_pct is not None:
            out["gain_pct"] = round(p.total_gain_pct, 6)
        return out

    payload = {
        "portfolio_value": round(portfolio.portfolio_value, 2),
        "currency": portfolio.currency,
        "positions": [_pos(p) for p in portfolio.positions[:max_positions]],
    }
    return json.dumps(payload, separators=(",", ":"))


def _survey_json_for_llm(survey: InvestorSurvey) -> str:
    return json.dumps(survey.model_dump(), separators=(",", ":"))


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

        prompt = SUMMARY_PROMPT.format(
            survey=_survey_json_for_llm(survey),
            portfolio=_portfolio_json_for_llm(portfolio),
            investor_types=investor_type_descriptions,
        )
        raw = await self._call_gemini(prompt)
        return PortfolioSummary(**raw)
    
    async def _get_garden(self, portfolio: Portfolio) -> PortfolioGarden:
        plant_type_descriptions = "\n".join(
            f" {k}: {v}" for k, v in PLANT_TYPES.items()
        )
        prompt = GARDEN_PROMPT.format(
            plant_types=plant_type_descriptions,
            portfolio=_portfolio_json_for_llm(portfolio),
        )
        raw = await self._call_gemini(prompt)
        plants = [PlantEntry(**p) for p in raw["plants"]]
        return PortfolioGarden(plants=plants)
    
    async def _call_gemini(self, prompt: str) -> dict:
        async with httpx.AsyncClient(timeout=GEMINI_TIMEOUT_SEC) as client:
            response = await client.post(
                GEMINI_URL,
                params={"key": settings.gemini_api_key},
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.8,
                        "maxOutputTokens": GEMINI_MAX_OUTPUT_TOKENS,
                        "response_mime_type": "application/json",
                    },
                },
            )

        try:
            data = response.json()
        except json.JSONDecodeError as e:
            raise ValueError(
                f"Gemini returned non-JSON HTTP body (status {response.status_code}): {response.text[:800]!r}"
            ) from e

        if response.status_code != 200:
            err = data.get("error", {})
            msg = err.get("message", response.text[:2000])
            code = err.get("code", response.status_code)
            raise ValueError(f"Gemini API error {code}: {msg}")

        if data.get("error"):
            raise ValueError(f"Gemini API error: {data['error']}")

        candidates = data.get("candidates") or []
        if not candidates:
            fb = data.get("promptFeedback")
            raise ValueError(
                f"No candidates returned (blocked or empty). promptFeedback={fb!r} "
                f"usageMetadata={data.get('usageMetadata')!r}"
            )

        cand = candidates[0]
        finish = cand.get("finishReason")
        content = cand.get("content")
        if not content:
            raise ValueError(
                f"No content in candidate (finishReason={finish!r}, "
                f"safetyRatings={cand.get('safetyRatings')!r})"
            )

        parts = content.get("parts") or []
        if not parts:
            raise ValueError(f"Empty content.parts (finishReason={finish!r})")

        raw_text = parts[0].get("text")
        if raw_text is None:
            raise ValueError(f"No text part (finishReason={finish!r}): {parts[0]!r}")

        raw_text = raw_text.strip()
        if raw_text.startswith("```"):
            raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
            raw_text = re.sub(r"\s*```$", "", raw_text)

        try:
            return json.loads(raw_text)
        except json.JSONDecodeError as e:
            usage = data.get("usageMetadata", {})
            hint = ""
            if finish == "MAX_TOKENS" or finish == "OTHER":
                hint = (
                    " Output may be truncated (MAX_TOKENS). "
                    "Try fewer positions in the prompt or raise GEMINI_MAX_OUTPUT_TOKENS."
                )
            raise ValueError(
                f"Gemini returned invalid JSON (finishReason={finish!r}, len={len(raw_text)}, "
                f"usageMetadata={usage!r}).{hint} Parse error: {e}. "
                f"Start of text: {raw_text[:400]!r}"
            ) from e
    