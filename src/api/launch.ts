import axios from "axios";
import type { Launch, CreateLaunchPayload, UpdateLaunchPayload } from "@/types/launch";
import { LEADS_API_BASE_URL, LEADS_API_HEADERS } from "@/api/leads-api-config";

const launchClient = axios.create({
  baseURL: LEADS_API_BASE_URL,
  headers: LEADS_API_HEADERS,
});

export async function fetchLaunches(): Promise<Launch[]> {
  const { data } = await launchClient.get<Launch[] | { items?: Launch[] }>("/launch");
  return Array.isArray(data) ? data : data.items ?? [];
}

export async function fetchLaunch(id: string): Promise<Launch> {
  const { data } = await launchClient.get<Launch>(`/launch/${id}`);
  return data;
}

export async function createLaunch(payload: CreateLaunchPayload): Promise<Launch> {
  const { data } = await launchClient.post<Launch>("/launch", payload);
  return data;
}

export async function updateLaunch(id: string, payload: UpdateLaunchPayload): Promise<Launch> {
  const { data } = await launchClient.patch<Launch>(`/launch/${id}`, payload);
  return data;
}

export async function deleteLaunch(id: string): Promise<void> {
  await launchClient.delete(`/launch/${id}`);
}
