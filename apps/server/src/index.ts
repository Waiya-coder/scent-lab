import cors from "cors";
import express from "express";
import type { MixSimulationRequest, QuizSubmission } from "@scent-lab/shared";
import { climates, lifestyles, moods, personalities } from "@scent-lab/shared";
import { mapFragrance } from "./lib/fragrance-mapper.js";
import { prisma } from "./lib/prisma.js";
import { buildRecommendations, simulateMix } from "./engine/recommendation.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

function isQuizSubmission(value: unknown): value is QuizSubmission {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.name === "string" &&
    lifestyles.includes(payload.lifestyle as (typeof lifestyles)[number]) &&
    personalities.includes(payload.personality as (typeof personalities)[number]) &&
    climates.includes(payload.climate as (typeof climates)[number]) &&
    moods.includes(payload.mood as (typeof moods)[number]) &&
    ["soft", "balanced", "statement"].includes(String(payload.intensity)) &&
    typeof payload.refillPreference === "boolean"
  );
}

function isMixSimulationRequest(value: unknown): value is MixSimulationRequest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;
  const accords = payload.accords as Record<string, unknown> | undefined;

  if (
    !accords ||
    !climates.includes(payload.climate as (typeof climates)[number]) ||
    !moods.includes(payload.mood as (typeof moods)[number])
  ) {
    return false;
  }

  const requiredAccords = ["citrus", "floral", "woods", "musk", "spice", "green"] as const;
  return requiredAccords.every((key) => typeof accords[key] === "number");
}

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    service: "scent-lab-api"
  });
});

app.get("/api/fragrances", async (_request, response) => {
  const records = await prisma.fragrance.findMany({
    include: {
      notes: true,
      targets: true
    },
    orderBy: {
      name: "asc"
    }
  });

  response.json({
    items: records.map(mapFragrance)
  });
});

app.post("/api/recommendation", async (request, response) => {
  if (!isQuizSubmission(request.body)) {
    return response.status(400).json({
      message: "Invalid quiz payload."
    });
  }

  const records = await prisma.fragrance.findMany({
    include: {
      notes: true,
      targets: true
    }
  });

  const fragrances = records.map(mapFragrance);
  const result = buildRecommendations(request.body, fragrances);

  const session = await prisma.surveySession.create({
    data: {
      customerName: request.body.name || null,
      lifestyle: request.body.lifestyle,
      personality: request.body.personality,
      climate: request.body.climate,
      mood: request.body.mood,
      intensity: request.body.intensity,
      refillPreference: request.body.refillPreference
    }
  });

  const fragranceBySlug = new Map(records.map((record) => [record.slug, record]));

  await prisma.surveyRecommendation.createMany({
    data: result.recommendations.map((recommendation, index) => {
      const fragrance = fragranceBySlug.get(recommendation.fragrance.id);

      if (!fragrance) {
        throw new Error(`Missing fragrance for slug ${recommendation.fragrance.id}`);
      }

      return {
        surveySessionId: session.id,
        fragranceId: fragrance.id,
        score: recommendation.score,
        rank: index + 1
      };
    })
  });

  return response.json(result);
});

app.post("/api/mix/simulate", (request, response) => {
  if (!isMixSimulationRequest(request.body)) {
    return response.status(400).json({
      message: "Invalid mix payload."
    });
  }

  return response.json(simulateMix(request.body));
});

app.listen(port, () => {
  console.log(`Scent Lab API running on http://localhost:${port}`);
});
