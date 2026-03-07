export type RiskTolerance = "low" | "medium" | "high";
export type InvestmentHorizon = "short" | "medium" | "long";

export interface InvestorSurvey {
  age: number;
  risk_tolerance: RiskTolerance;
  investment_horizon: InvestmentHorizon;
  total_assets: number;
  income?: number;
}

export interface Position {
  symbol: string;
  weight: number;
  market_value: number;
  quantity?: number;
  currency?: string;
  description?: string;
}

export interface Portfolio {
  portfolio_value: number;
  currency: string;
  positions: Position[];
}

export interface FullAnalysis {
  summary: {
    investor_type: string;
    summary: string;
    diversification: string;
    sector_concentration: string;
    geographic_exposure: string;
    risk_assessment: string;
  };
  garden: {
    plants: {
      symbol: string;
      plant_type: string;
      caption: string;
    }[];
  };
}
