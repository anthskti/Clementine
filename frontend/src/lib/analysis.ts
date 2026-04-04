import { Portfolio, FullAnalysis } from "@/types/portfolio";
import { InvestorSurvey } from "@/types/survey";
import { readApiError } from "@/lib/api-error";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const analyzePortfolio = async (
  portfolio: Portfolio,
  inputs: InvestorSurvey,
): Promise<FullAnalysis> => {
  const res = await fetch(`${API_BASE}/analysis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ portfolio, inputs }),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res, "Failed to analyze portfolio."));
  }
  return res.json();
};
