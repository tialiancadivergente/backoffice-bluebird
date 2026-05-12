import axios from "axios";
import type { LeadCaptureParams, LeadCaptureResponse, LeadExportParams, Temperature, Launch, Season } from "@/types/lead-capture";
import type { QuizAnswersResponse } from "@/types/quiz-answers";
import { LEADS_API_BASE_URL, LEADS_API_HEADERS } from "@/api/leads-api-config";

const leadCaptureClient = axios.create({
  baseURL: LEADS_API_BASE_URL,
  headers: LEADS_API_HEADERS,
});

export async function fetchLeadCaptures(params: LeadCaptureParams): Promise<LeadCaptureResponse> {
  const { data } = await leadCaptureClient.get<LeadCaptureResponse>("/capture", {
    params: { ...params, sort: "created_at", order: "desc" },
  });
  return data;
}

export async function exportLeadsCsv(params: LeadExportParams): Promise<Blob> {
  const { data } = await leadCaptureClient.get("/capture/export/csv", {
    params,
    responseType: "blob",
  });
  return data;
}

export async function exportLeadsExcel(params: LeadExportParams): Promise<Blob> {
  const { data } = await leadCaptureClient.get("/capture/export/excel", {
    params,
    responseType: "blob",
  });
  return data;
}

export async function fetchTemperatures(): Promise<Temperature[]> {
  const { data } = await leadCaptureClient.get<Temperature[]>("/temperature");
  return data;
}

export async function fetchLaunches(): Promise<Launch[]> {
  const { data } = await leadCaptureClient.get<Launch[]>("/launch");
  return data;
}

export async function fetchSeasons(launchId: string): Promise<Season[]> {
  const { data } = await leadCaptureClient.get<Season[]>("/season", {
    params: { launch_id: launchId },
  });
  return data;
}

export async function fetchQuizAnswers(captureId: string): Promise<QuizAnswersResponse> {
  const { data } = await leadCaptureClient.get<QuizAnswersResponse>(`/capture/${captureId}/quiz-answers`);
  return data;
}
