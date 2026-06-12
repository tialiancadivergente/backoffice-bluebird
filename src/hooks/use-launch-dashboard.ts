import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdAccounts,
  fetchAvailableQuestions,
  fetchLaunchAwareness,
  fetchLaunchConfig,
  fetchLaunchFunnelTable,
  fetchLaunchOptions,
  fetchLaunchSummary,
  fetchLaunchTimeseries,
  fetchLaunchTierDistribution,
  upsertLaunchConfig,
} from "@/api/launch-dashboard";
import type { LaunchDashboardConfig, LaunchDashboardFilters } from "@/types/launch-dashboard";

const launchDashKeys = {
  launches: () => ["launch-dashboard", "launches"] as const,
  summary: (f: LaunchDashboardFilters) => ["launch-dashboard", "summary", f] as const,
  timeseries: (f: LaunchDashboardFilters) => ["launch-dashboard", "timeseries", f] as const,
  funnel: (f: LaunchDashboardFilters) => ["launch-dashboard", "funnel", f] as const,
  awareness: (f: LaunchDashboardFilters) => ["launch-dashboard", "awareness", f] as const,
  tierDistribution: (f: LaunchDashboardFilters) => ["launch-dashboard", "tier-distribution", f] as const,
  config: (launchId: string) => ["launch-dashboard", "config", launchId] as const,
  adAccounts: (f: LaunchDashboardFilters) => ["launch-dashboard", "ad-accounts", f] as const,
  availableQuestions: (launchId?: string, seasonId?: string) => ["launch-dashboard", "available-questions", launchId, seasonId] as const,
};

function hasRequiredDates(f: LaunchDashboardFilters) {
  return Boolean(f.dateFrom && f.dateTo);
}

export function useLaunchOptions() {
  return useQuery({
    queryKey: launchDashKeys.launches(),
    queryFn: fetchLaunchOptions,
    staleTime: 60_000,
  });
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

export function useLaunchAwareness(filters: LaunchDashboardFilters) {
  return useQuery({
    queryKey: launchDashKeys.awareness(filters),
    queryFn: () => fetchLaunchAwareness(filters),
    enabled: hasRequiredDates(filters),
    placeholderData: (prev) => prev,
  });
}

export function useLaunchTierDistribution(filters: LaunchDashboardFilters) {
  return useQuery({
    queryKey: launchDashKeys.tierDistribution(filters),
    queryFn: () => fetchLaunchTierDistribution(filters),
    enabled: hasRequiredDates(filters),
    placeholderData: (prev) => prev,
  });
}

export function useLaunchConfig(launchId: string | undefined) {
  return useQuery({
    queryKey: launchDashKeys.config(launchId ?? ""),
    queryFn: () => fetchLaunchConfig(launchId!),
    enabled: Boolean(launchId),
    staleTime: 30_000,
  });
}

export function useAdAccounts(filters: LaunchDashboardFilters) {
  return useQuery({
    queryKey: launchDashKeys.adAccounts(filters),
    queryFn: () => fetchAdAccounts(filters),
    enabled: hasRequiredDates(filters),
    staleTime: 60_000,
  });
}

export function useAvailableQuestions(launchId?: string, seasonId?: string) {
  return useQuery({
    queryKey: launchDashKeys.availableQuestions(launchId, seasonId),
    queryFn: () => fetchAvailableQuestions(launchId, seasonId),
    staleTime: 5 * 60_000,
  });
}

export function useUpsertLaunchConfig(launchId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config: LaunchDashboardConfig) => upsertLaunchConfig(launchId!, config),
    onSuccess: () => {
      if (launchId) {
        qc.invalidateQueries({ queryKey: launchDashKeys.config(launchId) });
      }
    },
  });
}
