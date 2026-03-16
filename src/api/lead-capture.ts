import axios from "axios";
import type { LeadCaptureParams, LeadCaptureResponse, LeadExportParams } from "@/types/lead-capture";

const leadCaptureClient = axios.create({
  baseURL: "https://leads-api.aliancadivergente.com.br",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "lsk_prod_v1_W7mQ9nX2fK8rT4yP6cV3uJ1hD5sL0aB8eR2qN7tY4zM9pC6xG1kF5vH3jS8dU2",
  },
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
