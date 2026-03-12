export type RiskTolerance = "low" | "medium" | "high";
export type InvestmentHorizon = "short" | "medium" | "long";

export interface InvestorSurvey {
  age: number;
  risk_tolerance: RiskTolerance;
  investment_horizon: InvestmentHorizon;
  total_assets: number;
  income?: number;
}
