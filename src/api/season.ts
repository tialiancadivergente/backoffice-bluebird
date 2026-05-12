import axios from "axios";
import type { Season, CreateSeasonPayload, UpdateSeasonPayload } from "@/types/season";
import { LEADS_API_BASE_URL, LEADS_API_HEADERS } from "@/api/leads-api-config";

const seasonClient = axios.create({
  baseURL: LEADS_API_BASE_URL,
  headers: LEADS_API_HEADERS,
});

export async function fetchSeasons(launchId?: string): Promise<Season[]> {
  const params = launchId ? { launch_id: launchId } : {};
  const { data } = await seasonClient.get<Season[] | { items?: Season[] }>("/season", { params });
  return Array.isArray(data) ? data : data.items ?? [];
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
