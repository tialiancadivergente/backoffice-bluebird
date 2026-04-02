import axios from "axios";
import type { Season, CreateSeasonPayload, UpdateSeasonPayload } from "@/types/season";

const seasonClient = axios.create({
  baseURL: "https://leads-api.aliancadivergente.com.br",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "lsk_prod_v1_W7mQ9nX2fK8rT4yP6cV3uJ1hD5sL0aB8eR2qN7tY4zM9pC6xG1kF5vH3jS8dU2",
  },
});

export async function fetchSeasons(launchId?: string): Promise<Season[]> {
  const params = launchId ? { launch_id: launchId } : {};
  const { data } = await seasonClient.get<Season[]>("/season", { params });
  return Array.isArray(data) ? data : (data as any)?.items ?? [];
}

export async function fetchSeason(id: string): Promise<Season> {
  const { data } = await seasonClient.get<Season>(`/season/${id}`);
  return data;
}

export async function createSeason(payload: CreateSeasonPayload): Promise<Season> {
  const { data } = await seasonClient.post<Season>("/season", payload);
  return data;
}

export async function updateSeason(id: string, payload: UpdateSeasonPayload): Promise<Season> {
  const { data } = await seasonClient.patch<Season>(`/season/${id}`, payload);
  return data;
}

export async function deleteSeason(id: string): Promise<void> {
  await seasonClient.delete(`/season/${id}`);
}
