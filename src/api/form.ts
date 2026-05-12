import axios from "axios";
import type { Form, CreateFormPayload, UpdateFormPayload } from "@/types/form";
import { LEADS_API_BASE_URL, LEADS_API_HEADERS } from "@/api/leads-api-config";

const formClient = axios.create({
  baseURL: LEADS_API_BASE_URL,
  headers: LEADS_API_HEADERS,
});

export async function fetchForms(params?: { launch_id?: string; season_id?: string; type?: string }): Promise<Form[]> {
  const { data } = await formClient.get<Form[] | { items?: Form[] }>("/form", { params });
  return Array.isArray(data) ? data : data.items ?? [];
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
