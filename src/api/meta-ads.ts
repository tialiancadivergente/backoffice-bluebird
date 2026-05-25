import axios from "axios";
import { LEADS_API_BASE_URL, LEADS_API_HEADERS } from "@/api/leads-api-config";
import type {
  MetaAsyncJobStatus,
  MetaCampaign,
  MetaAd,
  MetaAdset,
  MetaAdPerformance,
  MetaCampaignBreakdown,
  MetaInsightsJobPayload,
  MetaPagedResult,
  MetaPerformanceFilters,
  MetaPerformanceSummary,
  MetaSyncExecution,
  MetaSyncPayload,
  MetaTimeseriesPoint,
} from "@/types/meta-ads";

const api = axios.create({
  baseURL: LEADS_API_BASE_URL,
  headers: LEADS_API_HEADERS,
});

// ─── Sync ─────────────────────────────────────────────────────────────────────

export async function syncMetaCampaigns(payload: MetaSyncPayload) {
  const { data } = await api.post("/meta-ads/sync/campaigns", payload);
  return data as { total: number; executionId: string };
}

export async function syncMetaAdsets(payload: MetaSyncPayload) {
  const { data } = await api.post("/meta-ads/sync/adsets", payload);
  return data as { total: number; executionId: string };
}

export async function syncMetaAds(payload: MetaSyncPayload) {
  const { data } = await api.post("/meta-ads/sync/ads", payload);
  return data as { total: number; executionId: string };
}

export async function syncMetaInsights(payload: MetaSyncPayload) {
  const { data } = await api.post("/meta-ads/sync/insights", payload);
  return data as { total: number; executionId: string };
}

export async function syncMetaAll(payload: MetaSyncPayload) {
  const { data } = await api.post("/meta-ads/sync/all", payload);
  return data as {
    campaigns: number;
    adsets: number;
    ads: number;
    insights: number;
  };
}

// ─── Async jobs ───────────────────────────────────────────────────────────────

export async function startMetaInsightsJob(payload: MetaInsightsJobPayload) {
  const { data } = await api.post("/meta-ads/jobs/insights", payload);
  return data as { report_run_id: string };
}

export async function checkMetaJob(
  reportRunId: string,
  connectionId: string,
): Promise<MetaAsyncJobStatus> {
  const { data } = await api.get(
    `/meta-ads/jobs/${reportRunId}/check?connectionId=${connectionId}`,
  );
  return data;
}

export async function getMetaJobResults(
  reportRunId: string,
  connectionId: string,
  opts?: { accountId?: string; save?: boolean },
) {
  const params = new URLSearchParams({ connectionId });
  if (opts?.accountId) params.set("accountId", opts.accountId);
  if (opts?.save) params.set("save", "true");
  const { data } = await api.get(
    `/meta-ads/jobs/${reportRunId}?${params.toString()}`,
  );
  return data as { data: unknown[]; saved?: number };
}

// ─── Data ─────────────────────────────────────────────────────────────────────

export async function getMetaCampaigns(params?: {
  accountId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<MetaPagedResult<MetaCampaign>> {
  const { data } = await api.get("/meta-ads/data/campaigns", { params });
  return data;
}

export async function getMetaAdsets(params?: {
  accountId?: string;
  campaignId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<MetaPagedResult<MetaAdset>> {
  const { data } = await api.get("/meta-ads/data/adsets", { params });
  return data;
}

export async function getMetaAds(params?: {
  accountId?: string;
  campaignId?: string;
  adsetId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<MetaPagedResult<MetaAd>> {
  const { data } = await api.get("/meta-ads/data/ads", { params });
  return data;
}

export async function getMetaPerformanceSummary(
  filters?: MetaPerformanceFilters,
): Promise<MetaPerformanceSummary> {
  const { data } = await api.get("/meta-ads/data/summary", {
    params: filters,
  });
  return data;
}

export async function getMetaTimeseries(
  filters?: MetaPerformanceFilters,
): Promise<MetaTimeseriesPoint[]> {
  const { data } = await api.get("/meta-ads/data/timeseries", {
    params: filters,
  });
  return data;
}

export async function getMetaCampaignBreakdown(
  filters?: MetaPerformanceFilters,
): Promise<MetaCampaignBreakdown[]> {
  const { data } = await api.get("/meta-ads/data/campaigns-breakdown", {
    params: filters,
  });
  return data;
}

export async function getMetaPerformance(
  filters?: MetaPerformanceFilters & { limit?: number; offset?: number },
): Promise<MetaPagedResult<MetaAdPerformance>> {
  const { data } = await api.get("/meta-ads/data/performance", {
    params: filters,
  });
  return data;
}

export async function getMetaExecutions(params?: {
  step?: string;
  status?: string;
  limit?: number;
}): Promise<MetaSyncExecution[]> {
  const { data } = await api.get("/meta-ads/executions", { params });
  return data;
}

export async function importMetaCsv(file: File): Promise<{ imported: number; skipped: number }> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<{ imported: number; skipped: number }>(
    "/meta-ads/data/import/csv",
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

export function getMetaCsvExportUrl(filters?: MetaPerformanceFilters & { limit?: number }) {
  const params = new URLSearchParams();
  if (filters?.accountId) params.set("accountId", filters.accountId);
  if (filters?.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters?.dateTo) params.set("dateTo", filters.dateTo);
  if (filters?.platform) params.set("platform", filters.platform);
  if (filters?.limit) params.set("limit", String(filters.limit));
  return `${LEADS_API_BASE_URL}/meta-ads/data/export/csv?${params.toString()}`;
}
