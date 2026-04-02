import axios from "axios";
import type { Launch, CreateLaunchPayload, UpdateLaunchPayload } from "@/types/launch";

const launchClient = axios.create({
  baseURL: "https://leads-api.aliancadivergente.com.br",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "lsk_prod_v1_W7mQ9nX2fK8rT4yP6cV3uJ1hD5sL0aB8eR2qN7tY4zM9pC6xG1kF5vH3jS8dU2",
  },
});

export async function fetchLaunches(): Promise<Launch[]> {
  const { data } = await launchClient.get<Launch[]>("/launch");
  return Array.isArray(data) ? data : (data as any)?.items ?? [];
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
