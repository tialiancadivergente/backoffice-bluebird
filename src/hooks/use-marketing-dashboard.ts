import { useQuery } from "@tanstack/react-query";
import {
  getMarketingDashboardFilters,
  getMarketingDashboardSummary,
  getMarketingDashboardTable,
  getMarketingDashboardTimeseries,
} from "@/api/marketing-dashboard";
import type { MarketingDashboardFilters, MarketingDashboardTableParams } from "@/types/marketing-dashboard";

export function useMarketingDashboardSummary(filters: MarketingDashboardFilters) {
  return useQuery({
    queryKey: ["marketing-dashboard", "summary", filters],
    queryFn: () => getMarketingDashboardSummary(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useMarketingDashboardFilterOptions(filters: MarketingDashboardFilters) {
  return useQuery({
    queryKey: ["marketing-dashboard", "filters", filters],
    queryFn: () => getMarketingDashboardFilters(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useMarketingDashboardTimeseries(filters: MarketingDashboardFilters) {
  return useQuery({
    queryKey: ["marketing-dashboard", "timeseries", filters],
    queryFn: () => getMarketingDashboardTimeseries(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useMarketingDashboardTable(params: MarketingDashboardTableParams) {
  return useQuery({
    queryKey: ["marketing-dashboard", "table", params],
    queryFn: () => getMarketingDashboardTable(params),
    placeholderData: (previousData) => previousData,
  });
}
