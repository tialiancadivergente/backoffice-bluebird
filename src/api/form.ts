import axios from "axios";
import type { Form, CreateFormPayload, UpdateFormPayload } from "@/types/form";

const formClient = axios.create({
  baseURL: "https://leads-api.aliancadivergente.com.br",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "lsk_prod_v1_W7mQ9nX2fK8rT4yP6cV3uJ1hD5sL0aB8eR2qN7tY4zM9pC6xG1kF5vH3jS8dU2",
  },
});

export async function fetchForms(params?: { launch_id?: string; season_id?: string; type?: string }): Promise<Form[]> {
  const { data } = await formClient.get<Form[]>("/form", { params });
  return Array.isArray(data) ? data : (data as any)?.items ?? [];
}

export async function fetchForm(id: string): Promise<Form> {
  const { data } = await formClient.get<Form>(`/form/${id}`);
  return data;
}

export async function createForm(payload: CreateFormPayload): Promise<Form> {
  const { data } = await formClient.post<Form>("/form", payload);
  return data;
}

export async function updateForm(id: string, payload: UpdateFormPayload): Promise<Form> {
  const { data } = await formClient.patch<Form>(`/form/${id}`, payload);
  return data;
}

export async function deleteForm(id: string): Promise<void> {
  await formClient.delete(`/form/${id}`);
}
