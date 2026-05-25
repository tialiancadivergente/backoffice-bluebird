import axios from "axios";
import type {
  CreateDailyJobsPayload,
  CreateManualJobsPayload,
  AdPerformanceCsvExportFilters,
  AdPerformanceCsvImportPayload,
  AdPerformanceCsvImportResult,
  MarketingSyncAccount,
  MarketingSyncConfiguration,
  MarketingSyncConfigurationPayload,
  MarketingSyncFilters,
  MarketingSyncJob,
  MarketingSyncPerformanceItem,
  MarketingSyncRawItem,
  OAuthConnection,
  OAuthConnectionAccount,
} from "@/types/syncs/marketing-sync";
import { LEADS_API_BASE_URL, LEADS_API_HEADERS } from "@/api/leads-api-config";

const api = axios.create({
  baseURL: LEADS_API_BASE_URL,
  headers: LEADS_API_HEADERS,
});

function pathForProvider(provider: string, suffix: string) {
  if (provider === "google_ads") return `/oauth/google-ads${suffix}`;
  if (provider === "meta_ads") return `/oauth/meta${suffix}`;
  throw new Error(`Provider nao suportado: ${provider}`);
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") return {};
  return value as Record<string, unknown>;
}

function firstString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return null;
}

function firstBoolean(record: Record<string, unknown>, keys: string[], fallback = false) {
  for (const key of keys) {
    if (typeof record[key] === "boolean") {
      return record[key];
    }
  }
  return fallback;
}

function stringAtPath(record: Record<string, unknown>, path: string[]) {
  let current: unknown = record;
  for (const segment of path) {
    if (!current || typeof current !== "object") return null;
    current = (current as Record<string, unknown>)[segment];
  }

  if (typeof current === "string" && current.trim().length > 0) {
    return current;
  }

  return null;
}

function firstStringAtPaths(record: Record<string, unknown>, paths: string[][]) {
  for (const path of paths) {
    const value = stringAtPath(record, path);
    if (value) return value;
  }
  return null;
}

function resolveAccountName(record: Record<string, unknown>) {
  return (
    firstString(record, [
      "accountName",
      "account_name",
      "customerName",
      "customer_name",
      "descriptiveName",
      "descriptive_name",
      "name",
    ]) ||
    firstStringAtPaths(record, [
      ["customer", "descriptiveName"],
      ["customer", "descriptive_name"],
      ["customerClient", "descriptiveName"],
      ["customerClient", "descriptive_name"],
      ["customer_client", "descriptiveName"],
      ["customer_client", "descriptive_name"],
      ["account", "name"],
      ["account", "descriptiveName"],
      ["account", "descriptive_name"],
    ])
  );
}

function readList(data: unknown) {
  if (Array.isArray(data)) return data;

  const record = asRecord(data);
  if (Array.isArray(record.items)) return record.items;
  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.connections)) return record.connections;
  if (Array.isArray(record.accounts)) return record.accounts;
  if (Array.isArray(record.jobs)) return record.jobs;
  if (Array.isArray(record.rows)) return record.rows;
  return [];
}

function normalizeConnection(value: unknown): OAuthConnection {
  const record = asRecord(value);
  const connectionId =
    firstString(record, ["connectionId", "connection_id", "id"]) ||
    `connection-${Math.random().toString(36).slice(2, 10)}`;

  return {
    id: firstString(record, ["id"]) || connectionId,
    provider: firstString(record, ["provider"]) || "desconhecido",
    userName: firstString(record, ["userName", "user_name", "email", "name"]),
    status: firstString(record, ["status"]),
    connectionId,
    selectedAccountId: firstString(record, [
      "selectedAccountId",
      "selected_account_id",
      "officialAccountId",
      "official_account_id",
    ]),
    selectedAccountName: firstString(record, ["selectedAccountName", "selected_account_name", "officialAccountName"]),
    raw: record,
  };
}

function normalizeConnectionAccount(value: unknown): OAuthConnectionAccount {
  const record = asRecord(value);
  const accountId = firstString(record, ["accountId", "account_id", "id", "externalAccountId"]) || "sem-id";

  return {
    id: firstString(record, ["id"]) || accountId,
    accountId,
    accountName: resolveAccountName(record),
    currency: firstString(record, ["currency", "currencyCode"]),
    timezone: firstString(record, ["timezone", "timeZone"]),
    selected: firstBoolean(record, ["selected", "isSelected", "official"], false),
    raw: record,
  };
}

function normalizeSyncAccount(value: unknown): MarketingSyncAccount {
  const record = asRecord(value);
  const accountId = firstString(record, ["accountId", "account_id", "externalAccountId", "id"]) || "sem-id";
  const id = firstString(record, ["id", "accountSyncId"]) || accountId;

  return {
    id,
    provider: firstString(record, ["provider"]) || "desconhecido",
    connectionId: firstString(record, ["connectionId", "connection_id"]),
    accountId,
    accountName: resolveAccountName(record),
    status: firstString(record, ["status"]),
    selected: firstBoolean(record, ["selected", "isSelected"], false),
    raw: record,
  };
}

function normalizeJob(value: unknown): MarketingSyncJob {
  const record = asRecord(value);
  const id = firstString(record, ["id", "jobId", "job_id"]) || `job-${Math.random().toString(36).slice(2, 10)}`;

  return {
    id,
    provider: firstString(record, ["provider"]) || null,
    connectionId: firstString(record, ["connectionId", "connection_id"]),
    accountId: firstString(record, ["accountId", "account_id", "externalAccountId"]),
    accountName: resolveAccountName(record),
    dateFrom: firstString(record, ["dateFrom", "date_from"]),
    dateTo: firstString(record, ["dateTo", "date_to"]),
    status: firstString(record, ["status"]),
    error: firstString(record, ["error", "errorMessage", "error_message"]),
    createdAt: firstString(record, ["createdAt", "created_at"]),
    raw: record,
  };
}

function normalizeRawItem(value: unknown): MarketingSyncRawItem {
  const record = asRecord(value);
  return {
    id: firstString(record, ["id"]) || `raw-${Math.random().toString(36).slice(2, 10)}`,
    provider: firstString(record, ["provider"]),
    connectionId: firstString(record, ["connectionId", "connection_id"]),
    accountId: firstString(record, ["accountId", "account_id", "externalAccountId"]),
    date: firstString(record, ["date", "day"]),
    payload: record,
  };
}

function normalizePerformanceItem(value: unknown): MarketingSyncPerformanceItem {
  const record = asRecord(value);
  return {
    id: firstString(record, ["id"]) || `perf-${Math.random().toString(36).slice(2, 10)}`,
    provider: firstString(record, ["provider"]),
    accountId: firstString(record, ["accountId", "account_id", "externalAccountId"]),
    date: firstString(record, ["date", "day"]),
    metrics: record,
  };
}

function sanitizeParams(params: object) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""));
}

function firstNumber(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function normalizeCsvImportResult(value: unknown): AdPerformanceCsvImportResult {
  const record = asRecord(value);
  return {
    importedRows: firstNumber(record, ["importedRows", "imported_rows"]) ?? 0,
    inserted: firstNumber(record, ["inserted"]) ?? 0,
    updated: firstNumber(record, ["updated"]) ?? 0,
    affectedGroups: firstNumber(record, ["affectedGroups", "affected_groups"]) ?? 0,
  };
}

export async function getAuthorizeUrl(provider: string): Promise<string> {
  const { data } = await api.get(pathForProvider(provider, "/authorize"));

  if (typeof data === "string" && data.startsWith("http")) return data;

  const record = asRecord(data);
  const url = firstString(record, ["authorizationUrl", "url", "authorizeUrl", "authorize_url", "redirect", "redirectUrl"]);
  if (!url) {
    throw new Error("Backend nao retornou URL de autorizacao.");
  }

  return url;
}

export async function getOAuthConnections(): Promise<OAuthConnection[]> {
  const { data } = await api.get("/oauth/connections");
  return readList(data).map(normalizeConnection);
}

export async function getConnectionAccounts(provider: string, connectionId: string): Promise<OAuthConnectionAccount[]> {
  const { data } = await api.get(pathForProvider(provider, `/connections/${connectionId}/accounts`));
  return readList(data).map(normalizeConnectionAccount);
}

export async function disconnectOAuthConnection(provider: string, connectionId: string) {
  await api.delete(pathForProvider(provider, `/connections/${connectionId}`));
}

export async function selectConnectionAccount(
  provider: string,
  connectionId: string,
  accountId: string,
) {
  await api.post(pathForProvider(provider, `/connections/${connectionId}/select-account`), {
    accountId,
    externalAccountId: accountId,
    selectedAccountId: accountId,
  });
}

export async function refreshAllMarketingSyncAccounts() {
  await api.post("/marketing-sync/accounts/refresh");
}

export async function refreshConnectionMarketingSyncAccounts(connectionId: string) {
  await api.post(`/marketing-sync/connections/${connectionId}/accounts/refresh`);
}

export async function getMarketingSyncAccounts(filters: MarketingSyncFilters): Promise<MarketingSyncAccount[]> {
  const { data } = await api.get("/marketing-sync/accounts", {
    params: sanitizeParams(filters),
  });

  return readList(data).map(normalizeSyncAccount);
}

export async function patchMarketingSyncAccountSelection(accountId: string, selected: boolean) {
  await api.patch(`/marketing-sync/accounts/${accountId}/selection`, { selected });
}

export async function createDailyJobs(payload?: CreateDailyJobsPayload) {
  await api.post("/marketing-sync/jobs/daily", payload ?? {});
}

export async function createManualJobs(payload: CreateManualJobsPayload) {
  await api.post("/marketing-sync/jobs/manual", payload);
}

export async function getMarketingSyncJobs(filters?: { provider?: string; connectionId?: string; status?: string }) {
  const { data } = await api.get("/marketing-sync/jobs", {
    params: sanitizeParams(filters ?? {}),
  });

  return readList(data).map(normalizeJob);
}

export async function enqueueMarketingSyncJob(jobId: string) {
  await api.post(`/marketing-sync/jobs/${jobId}/enqueue`);
}

export async function processMarketingSyncJob(jobId: string) {
  await api.post(`/marketing-sync/jobs/${jobId}/process`);
}

export async function getMarketingSyncRaw(filters?: { provider?: string; connectionId?: string; accountId?: string; limit?: number }) {
  const { data } = await api.get("/marketing-sync/raw", {
    params: sanitizeParams(filters ?? {}),
  });

  return readList(data).map(normalizeRawItem);
}

export async function getMarketingSyncPerformance(filters?: { provider?: string; connectionId?: string; accountId?: string; limit?: number }) {
  const { data } = await api.get("/marketing-sync/performance", {
    params: sanitizeParams(filters ?? {}),
  });

  return readList(data).map(normalizePerformanceItem);
}

export async function exportAdPerformanceCsv(filters?: AdPerformanceCsvExportFilters) {
  const response = await api.get("/marketing-sync/ad-performance/export/csv", {
    params: sanitizeParams(filters ?? {}),
    responseType: "blob",
  });

  const contentDisposition = response.headers["content-disposition"];
  const filenameMatch =
    typeof contentDisposition === "string" ? contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/) : null;

  return {
    blob: response.data as Blob,
    filename: filenameMatch?.[1] ? decodeURIComponent(filenameMatch[1]) : "marketing-ad-performance-export.csv",
  };
}

export async function importAdPerformanceCsv(payload: AdPerformanceCsvImportPayload): Promise<AdPerformanceCsvImportResult> {
  const formData = new FormData();
  formData.append("file", payload.file);
  if (payload.provider) {
    formData.append("provider", payload.provider);
  }

  const { data } = await api.post("/marketing-sync/ad-performance/import/csv", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return normalizeCsvImportResult(data);
}

function normalizeConfiguration(value: unknown): MarketingSyncConfiguration {
  const record = asRecord(value);
  return {
    id: firstString(record, ["id"]) || `cfg-${Math.random().toString(36).slice(2, 10)}`,
    syncKey: firstString(record, ["syncKey", "sync_key"]) || "",
    provider: firstString(record, ["provider"]),
    enabled: firstBoolean(record, ["enabled"], false),
    scheduleEnabled: firstBoolean(record, ["scheduleEnabled", "schedule_enabled"], false),
    scheduleIntervalMinutes: (() => {
      if (typeof record.scheduleIntervalMinutes === "number") return record.scheduleIntervalMinutes;
      if (typeof record.schedule_interval_minutes === "number") return record.schedule_interval_minutes;
      return null;
    })(),
    config: record.config !== null && typeof record.config === "object" ? (record.config as Record<string, unknown>) : null,
    metadata: record.metadata !== null && typeof record.metadata === "object" ? (record.metadata as Record<string, unknown>) : null,
    createdAt: firstString(record, ["createdAt", "created_at"]) || "",
    updatedAt: firstString(record, ["updatedAt", "updated_at"]) || "",
  };
}

export async function getMarketingSyncConfigurations(): Promise<MarketingSyncConfiguration[]> {
  const { data } = await api.get("/marketing-sync/configurations");
  return readList(data).map(normalizeConfiguration);
}

export async function saveMarketingSyncConfiguration(
  payload: MarketingSyncConfigurationPayload,
): Promise<MarketingSyncConfiguration> {
  const { data } = await api.post("/marketing-sync/configurations", payload);
  return normalizeConfiguration(data);
}
