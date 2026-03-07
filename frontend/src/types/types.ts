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
export interface Plant {
  symbol: string;
  plant_type: string;
  caption: string;
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
    plants: Plant[];
  };
}

export const GARDENER_TYPES: Record<string, string> = {
  "Seed Hoarder": "/assets/types/seed_hoarder.png",
  Overwaterer: "/assets/types/overwaterer.png",
  "Negligent Gardener": "/assets/types/negligent_gardener.png",
  "Healthy Gardener": "/assets/types/healthy_gardener.png",
  "Experimental Gardener": "/assets/types/experimental_gardner.png", // matches your filename typo
};

// Map backend plant types to flower assets
// (You'll need to add these images to a public/assets/flowers/ folder)
export const FLOWER_TYPES: Record<string, string> = {
  healthy_flower: "/assets/flowers/healthy_plant.png",
  wilting: "/assets/flowers/wilting_plant.png",
  weed: "/assets/flowers/weed.png",
  time_to_trim: "/assets/flowers/towering_plant.png",
  overwatered: "/assets/flowers/overwatered_plant.png",
  dead: "/assets/flower/dead_plant.png",
};
