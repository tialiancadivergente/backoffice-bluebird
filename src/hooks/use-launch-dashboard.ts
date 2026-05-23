import { useQuery } from "@tanstack/react-query";
import {
  fetchLaunchFunnelTable,
  fetchLaunchOptions,
  fetchLaunchSummary,
  fetchLaunchTimeseries,
} from "@/api/launch-dashboard";
import type { LaunchDashboardFilters } from "@/types/launch-dashboard";

const launchDashKeys = {
  launches: () => ["launch-dashboard", "launches"] as const,
  summary: (f: LaunchDashboardFilters) => ["launch-dashboard", "summary", f] as const,
  timeseries: (f: LaunchDashboardFilters) => ["launch-dashboard", "timeseries", f] as const,
  funnel: (f: LaunchDashboardFilters) => ["launch-dashboard", "funnel", f] as const,
};

export function useLaunchOptions() {
  return useQuery({
    queryKey: launchDashKeys.launches(),
    queryFn: fetchLaunchOptions,
    staleTime: 60_000,
  });
}

function hasRequiredDates(f: LaunchDashboardFilters) {
  return Boolean(f.dateFrom && f.dateTo);
}

export function useLaunchSummary(filters: LaunchDashboardFilters) {
  return useQuery({
    queryKey: launchDashKeys.summary(filters),
    queryFn: () => fetchLaunchSummary(filters),
    enabled: hasRequiredDates(filters),
    placeholderData: (prev) => prev,
  });
}

export function useLaunchTimeseries(filters: LaunchDashboardFilters) {
  return useQuery({
    queryKey: launchDashKeys.timeseries(filters),
    queryFn: () => fetchLaunchTimeseries(filters),
    enabled: hasRequiredDates(filters),
    placeholderData: (prev) => prev,
  });
}

export function useLaunchFunnelTable(filters: LaunchDashboardFilters) {
  return useQuery({
    queryKey: launchDashKeys.funnel(filters),
    queryFn: () => fetchLaunchFunnelTable(filters),
    enabled: hasRequiredDates(filters),
    placeholderData: (prev) => prev,
  });
}
