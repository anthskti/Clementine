import { Portfolio, InvestorSurvey, FullAnalysis } from "@/types/types";

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
  if (!res.ok) throw new Error("Failed to analyze portfolio");
  return res.json();
};
