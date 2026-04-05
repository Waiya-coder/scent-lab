export const lifestyles = ["creative", "outdoorsy", "urban", "wellness", "traveler"] as const;
export const personalities = ["bold", "romantic", "grounded", "curious", "luxurious"] as const;
export const climates = ["hot", "temperate", "cold", "humid", "dry"] as const;
export const moods = ["energizing", "sensual", "grounded", "playful", "serene"] as const;

export type Lifestyle = (typeof lifestyles)[number];
export type Personality = (typeof personalities)[number];
export type Climate = (typeof climates)[number];
export type Mood = (typeof moods)[number];

export type FragranceFamily = "citrus" | "floral" | "woody" | "amber" | "green" | "spice";
export type Intensity = "soft" | "balanced" | "statement";

export interface AccordLevels {
  citrus: number;
  floral: number;
  woods: number;
  musk: number;
  spice: number;
  green: number;
}

export interface Fragrance {
  id: string;
  brand: string;
  name: string;
  tagline: string;
  family: FragranceFamily;
  notes: string[];
  imageUrl: string;
  productUrl: string;
  bestFor: {
    lifestyles: Lifestyle[];
    personalities: Personality[];
    climates: Climate[];
    moods: Mood[];
  };
  longevity: number;
  sillage: Intensity;
  refillable: boolean;
  sustainabilityScore: number;
  accordLevels: AccordLevels;
}

export interface QuizSubmission {
  name: string;
  lifestyle: Lifestyle;
  personality: Personality;
  climate: Climate;
  mood: Mood;
  intensity: Intensity;
  refillPreference: boolean;
}

export interface Recommendation {
  fragrance: Fragrance;
  score: number;
  whyItFits: string[];
}

export interface RecommendationResponse {
  profileLabel: string;
  summary: string;
  recommendations: Recommendation[];
}

export interface FragranceCatalogResponse {
  items: Fragrance[];
}

export interface MixSimulationRequest {
  mood: Mood;
  climate: Climate;
  accords: AccordLevels;
}

export interface MixSimulationResponse {
  blendName: string;
  description: string;
  highlightedNotes: string[];
  intensity: Intensity;
  sustainabilityHint: string;
}
