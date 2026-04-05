import type {
  AccordLevels,
  Climate,
  Intensity,
  MixSimulationRequest,
  MixSimulationResponse,
  Mood,
  QuizSubmission,
  Recommendation,
  RecommendationResponse
} from "@scent-lab/shared";
import type { Fragrance } from "@scent-lab/shared";

const intensityWeights: Record<Intensity, number> = {
  soft: 12,
  balanced: 18,
  statement: 24
};

const moodBias: Record<Mood, Partial<AccordLevels>> = {
  energizing: { citrus: 18, green: 10, spice: -6, musk: -6 },
  sensual: { musk: 16, spice: 12, floral: 8, citrus: -8 },
  grounded: { woods: 16, green: 12, citrus: -4 },
  playful: { citrus: 14, floral: 10, green: 8, woods: -4 },
  serene: { floral: 8, woods: 10, musk: 8, spice: -10 }
};

const climateBias: Record<Climate, Partial<AccordLevels>> = {
  hot: { citrus: 14, green: 10, musk: -4, spice: -6 },
  temperate: {},
  cold: { woods: 10, musk: 10, spice: 10 },
  humid: { green: 12, citrus: 10, woods: -4 },
  dry: { musk: 8, floral: 8, woods: 6 }
};

function scoreFragrance(quiz: QuizSubmission, fragrance: Fragrance): Recommendation {
  let score = 0;
  const whyItFits: string[] = [];

  if (fragrance.bestFor.lifestyles.includes(quiz.lifestyle)) {
    score += 20;
    whyItFits.push(`Matches a ${quiz.lifestyle} lifestyle`);
  }

  if (fragrance.bestFor.personalities.includes(quiz.personality)) {
    score += 18;
    whyItFits.push(`Aligns with a ${quiz.personality} personality`);
  }

  if (fragrance.bestFor.climates.includes(quiz.climate)) {
    score += 16;
    whyItFits.push(`Balances well in ${quiz.climate} weather`);
  }

  if (fragrance.bestFor.moods.includes(quiz.mood)) {
    score += 18;
    whyItFits.push(`Fits your ${quiz.mood} mood`);
  }

  if (quiz.refillPreference && fragrance.refillable) {
    score += 10;
    whyItFits.push("Supports a refill-first routine");
  }

  const requestedIntensity = intensityWeights[quiz.intensity];
  const fragranceIntensity = intensityWeights[fragrance.sillage];
  const intensityDelta = Math.abs(requestedIntensity - fragranceIntensity);
  score += Math.max(0, 14 - intensityDelta);

  score += Math.round(fragrance.sustainabilityScore / 10);

  return {
    fragrance,
    score,
    whyItFits
  };
}

function createProfileLabel(quiz: QuizSubmission): string {
  return `${quiz.mood.charAt(0).toUpperCase()}${quiz.mood.slice(1)} ${quiz.personality.charAt(0).toUpperCase()}${quiz.personality.slice(1)}`;
}

function createSummary(quiz: QuizSubmission): string {
  return `${quiz.name || "You"} lean ${quiz.personality}, live a ${quiz.lifestyle} lifestyle, and need a scent that feels ${quiz.mood} in ${quiz.climate} conditions.`;
}

export function buildRecommendations(quiz: QuizSubmission, fragrances: Fragrance[]): RecommendationResponse {
  const ranked = fragrances
    .map((fragrance) => scoreFragrance(quiz, fragrance))
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  return {
    profileLabel: createProfileLabel(quiz),
    summary: createSummary(quiz),
    recommendations: ranked
  };
}

function dominantAccords(accords: AccordLevels): string[] {
  return Object.entries(accords)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([key]) => key);
}

function describeBlend(topAccords: string[], mood: Mood, climate: Climate): string {
  const accordText = topAccords.join(", ");
  return `A ${mood} blend led by ${accordText}, tuned to stay expressive in ${climate} conditions.`;
}

function inferNotes(topAccords: string[]): string[] {
  const map: Record<string, string[]> = {
    citrus: ["bergamot", "clementine"],
    floral: ["rose", "jasmine tea"],
    woods: ["cedar", "sandalwood"],
    musk: ["skin musk", "cashmere musk"],
    spice: ["pink pepper", "cardamom"],
    green: ["violet leaf", "basil"]
  };

  return topAccords.flatMap((accord) => map[accord] ?? []).slice(0, 4);
}

function inferIntensity(accords: AccordLevels): Intensity {
  const total = Object.values(accords).reduce((sum, value) => sum + value, 0);

  if (total < 180) {
    return "soft";
  }

  if (total < 320) {
    return "balanced";
  }

  return "statement";
}

export function simulateMix(request: MixSimulationRequest): MixSimulationResponse {
  const adjustedAccords: AccordLevels = { ...request.accords };

  for (const [accord, delta] of Object.entries(moodBias[request.mood])) {
    const key = accord as keyof AccordLevels;
    adjustedAccords[key] = Math.max(0, Math.min(100, adjustedAccords[key] + (delta ?? 0)));
  }

  for (const [accord, delta] of Object.entries(climateBias[request.climate])) {
    const key = accord as keyof AccordLevels;
    adjustedAccords[key] = Math.max(0, Math.min(100, adjustedAccords[key] + (delta ?? 0)));
  }

  const topAccords = dominantAccords(adjustedAccords);
  const leadAccord = topAccords[0] ?? "balanced";
  const intensity = inferIntensity(adjustedAccords);
  const name = `${request.mood.charAt(0).toUpperCase()}${request.mood.slice(1)} ${leadAccord.charAt(0).toUpperCase()}${leadAccord.slice(1)} Blend`;

  return {
    blendName: name,
    description: describeBlend(topAccords, request.mood, request.climate),
    highlightedNotes: inferNotes(topAccords),
    intensity,
    sustainabilityHint: "Favor concentrated refills and modular vials to reduce packaging waste as you iterate."
  };
}
