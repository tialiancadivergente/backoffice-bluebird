import axios from "axios";
import type {
  AdAccountOption,
  AvailableQuestion,
  LaunchDashboardConfig,
  LaunchDashboardFilters,
  LaunchDashboardFunnelResponse,
  LaunchDashboardSummaryResponse,
  LaunchDashboardTimeseriesResponse,
  LaunchAwarenessMetrics,
  LaunchTierDistribution,
  LaunchOption,
} from "@/types/launch-dashboard";
import { LEADS_API_BASE_URL, LEADS_API_HEADERS } from "@/api/leads-api-config";

const api = axios.create({
  baseURL: LEADS_API_BASE_URL,
  headers: LEADS_API_HEADERS,
});

function toParams(filters: LaunchDashboardFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== ""),
  );
}

export async function fetchLaunchOptions(): Promise<LaunchOption[]> {
  const { data } = await api.get<LaunchOption[]>("/launch-dashboard/launches");
  return Array.isArray(data) ? data : [];
}

export async function fetchLaunchSummary(
  filters: LaunchDashboardFilters,
): Promise<LaunchDashboardSummaryResponse> {
  const { data } = await api.get<LaunchDashboardSummaryResponse>(
    "/launch-dashboard/summary",
    { params: toParams(filters) },
  );
  return data;
}

export async function fetchLaunchTimeseries(
  filters: LaunchDashboardFilters,
): Promise<LaunchDashboardTimeseriesResponse> {
  const { data } = await api.get<LaunchDashboardTimeseriesResponse>(
    "/launch-dashboard/timeseries",
    { params: toParams(filters) },
  );
  return data;
}

export async function fetchLaunchFunnelTable(
  filters: LaunchDashboardFilters,
): Promise<LaunchDashboardFunnelResponse> {
  const { data } = await api.get<LaunchDashboardFunnelResponse>(
    "/launch-dashboard/funnel",
    { params: toParams(filters) },
  );
  return data;
}

export async function fetchLaunchAwareness(
  filters: LaunchDashboardFilters,
): Promise<LaunchAwarenessMetrics> {
  const { data } = await api.get<LaunchAwarenessMetrics>(
    "/launch-dashboard/awareness",
    { params: toParams(filters) },
  );
  return data;
}

export async function fetchLaunchTierDistribution(
  filters: LaunchDashboardFilters,
): Promise<LaunchTierDistribution> {
  const { data } = await api.get<LaunchTierDistribution>(
    "/launch-dashboard/tier-distribution",
    { params: toParams(filters) },
  );
  return data;
}

// O backend retorna a entidade com snake_case; este mapper converte para o tipo frontend.
function mapConfig(raw: Record<string, unknown>): LaunchDashboardConfig {
  const n = (v: unknown) => (v != null ? Number(v) : null);
  return {
    id: raw.id as string,
    launchId: raw.launch_id as string,
    targetSpend: n(raw.target_spend),
    targetLeads: n(raw.target_leads),
    targetCpl: n(raw.target_cpl),
    targetConnectRate: n(raw.target_connect_rate),
    targetPageConversion: n(raw.target_page_conversion),
    targetCpc: n(raw.target_cpc),
    targetCpm: n(raw.target_cpm),
    targetCtr: n(raw.target_ctr),
    targetSurveyResponseRate: n(raw.target_survey_response_rate),
    targetConsciousnessRate: n(raw.target_consciousness_rate),
    targetKnowsExpertRate: n(raw.target_knows_expert_rate),
    targetKnowsAllianceRate: n(raw.target_knows_alliance_rate),
    questionKeyConsciousness: (raw.question_key_consciousness as string) ?? null,
    positiveOptionKeyConsciousness: (raw.positive_option_key_consciousness as string) ?? null,
    questionKeyKnowsExpert: (raw.question_key_knows_expert as string) ?? null,
    positiveOptionKeyKnowsExpert: (raw.positive_option_key_knows_expert as string) ?? null,
    questionKeyKnowsAlliance: (raw.question_key_knows_alliance as string) ?? null,
    positiveOptionKeyKnowsAlliance: (raw.positive_option_key_knows_alliance as string) ?? null,
  };
}

export async function fetchLaunchConfig(launchId: string): Promise<LaunchDashboardConfig | null> {
  const { data } = await api.get<Record<string, unknown> | null>(
    `/launch-dashboard/config/${launchId}`,
  );
  return data ? mapConfig(data) : null;
}

export async function upsertLaunchConfig(
  launchId: string,
  config: LaunchDashboardConfig,
): Promise<LaunchDashboardConfig> {
  const { data } = await api.put<Record<string, unknown>>(
    `/launch-dashboard/config/${launchId}`,
    config,
  );
  return mapConfig(data);
}

export async function fetchAdAccounts(filters: LaunchDashboardFilters): Promise<AdAccountOption[]> {
  const { data } = await api.get<AdAccountOption[]>(
    "/launch-dashboard/ad-accounts",
    { params: toParams(filters) },
  );
  return Array.isArray(data) ? data : [];
}

export async function fetchAvailableQuestions(launchId?: string, seasonId?: string): Promise<AvailableQuestion[]> {
  const params: Record<string, string> = {};
  if (launchId) params.launchId = launchId;
  if (seasonId) params.seasonId = seasonId;
  const { data } = await api.get<AvailableQuestion[]>(
    "/launch-dashboard/available-questions",
    { params: Object.keys(params).length ? params : undefined },
  );
  return Array.isArray(data) ? data : [];
}
