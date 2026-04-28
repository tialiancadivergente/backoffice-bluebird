import { useQuery } from "@tanstack/react-query";
import {
  getMarketingSyncAccounts,
  getMarketingSyncConfigurations,
  getMarketingSyncJobs,
  getMarketingSyncPerformance,
  getMarketingSyncRaw,
  getOAuthConnections,
} from "@/api/syncs/marketing-sync";
import type { MarketingSyncFilters } from "@/types/syncs/marketing-sync";

export function useOAuthConnections() {
  return useQuery({
    queryKey: ["marketing-sync", "oauth-connections"],
    queryFn: getOAuthConnections,
    placeholderData: (previousData) => previousData,
  });
}

export function useMarketingSyncAccounts(filters: MarketingSyncFilters) {
  return useQuery({
    queryKey: ["marketing-sync", "accounts", filters],
    queryFn: () => getMarketingSyncAccounts(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useMarketingSyncJobs(filters?: { provider?: string; connectionId?: string; status?: string }) {
  return useQuery({
    queryKey: ["marketing-sync", "jobs", filters ?? {}],
    queryFn: () => getMarketingSyncJobs(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useMarketingSyncRaw(filters?: { provider?: string; connectionId?: string; accountId?: string; limit?: number }) {
  return useQuery({
    queryKey: ["marketing-sync", "raw", filters ?? {}],
    queryFn: () => getMarketingSyncRaw(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useMarketingSyncPerformance(filters?: { provider?: string; connectionId?: string; accountId?: string; limit?: number }) {
  return useQuery({
    queryKey: ["marketing-sync", "performance", filters ?? {}],
    queryFn: () => getMarketingSyncPerformance(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useMarketingSyncConfigurations() {
  return useQuery({
    queryKey: ["marketing-sync", "configurations"],
    queryFn: getMarketingSyncConfigurations,
    placeholderData: (previousData) => previousData,
  });
}
