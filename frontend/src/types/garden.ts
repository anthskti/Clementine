export const GARDENER_TYPES: Record<string, string> = {
  hoarder: "/assets/types/seed_hoarder.png",
  overwaterer: "/assets/types/overwaterer_gardener.png",
  negligent: "/assets/types/negligent_gardener.png",
  healthy: "/assets/types/healthy_gardener.png",
  experimental: "/assets/types/experimental_gardener.png",
};

// Map backend plant types to flower assets
export const FLOWER_TYPES: Record<string, string> = {
  healthy_flower: "/assets/flowers/healthy_plant.png",
  wilting: "/assets/flowers/wilting_plant.png",
  weed: "/assets/flowers/weed.png",
  time_to_trim: "/assets/flowers/towering_plant.png",
  overwatered: "/assets/flowers/overwatered_plant.png",
  dead: "/assets/flower/dead_plant.png",
};

export const GARDENER_DESCRIPTION: Record<string, string> = {
  hoarder:
    "The gardener who loves to wait for the perfect time to plants his seeds.",
  negligent: "The gardener who has not watered or trimmed their garden.",
  healthy: "The gardener who has a balanced, healthy garden",
  experimental:
    "The gardener who is invested too heavy into speculative plants",
  overwaterer: "The gardener who has too much invested in their top plants.",
};
