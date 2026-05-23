import axios from "axios";
import type {
  LaunchDashboardFilters,
  LaunchDashboardFunnelResponse,
  LaunchDashboardSummaryResponse,
  LaunchDashboardTimeseriesResponse,
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
