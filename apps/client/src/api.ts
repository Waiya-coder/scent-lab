import type {
  FragranceCatalogResponse,
  MixSimulationRequest,
  MixSimulationResponse,
  RecommendationResponse,
  QuizSubmission
} from "@scent-lab/shared";
import { Platform } from "react-native";

const PROD_API_URL = process.env.EXPO_PUBLIC_API_URL?.trim();
const DEV_API_URL = Platform.OS === "ios" ? "http://127.0.0.1:4000" : "http://10.0.2.2:4000";
const API_BASE_URL = PROD_API_URL && PROD_API_URL.length > 0 ? PROD_API_URL : DEV_API_URL;

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export async function fetchRecommendation(payload: QuizSubmission): Promise<RecommendationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/recommendation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseResponse<RecommendationResponse>(response);
}

export async function fetchFragrances(): Promise<FragranceCatalogResponse> {
  const response = await fetch(`${API_BASE_URL}/api/fragrances`);
  return parseResponse<FragranceCatalogResponse>(response);
}

export async function fetchMixSimulation(payload: MixSimulationRequest): Promise<MixSimulationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/mix/simulate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseResponse<MixSimulationResponse>(response);
}
