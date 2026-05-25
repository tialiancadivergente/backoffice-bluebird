import { useQuery } from "@tanstack/react-query";
import { getHotmartProducts, getSales, getSalesSummary, getSyncSchedules } from "@/api/hotmart";
import type { HotmartSalesFilters, HotmartSummaryFilters } from "@/types/hotmart";

export function useHotmartSales(filters: HotmartSalesFilters, enabled = true) {
  return useQuery({
    queryKey: ["hotmart-sales", filters],
    queryFn: () => getSales(filters),
    placeholderData: (prev) => prev,
    enabled,
  });
}

export function useHotmartSummary(filters: HotmartSummaryFilters) {
  return useQuery({
    queryKey: ["hotmart-summary", filters],
    queryFn: () => getSalesSummary(filters),
    placeholderData: (prev) => prev,
  });
}

export function useHotmartProducts() {
  return useQuery({
    queryKey: ['hotmart-products'],
    queryFn: getHotmartProducts,
  });
}

export function useHotmartSyncSchedules() {
  return useQuery({
    queryKey: ['hotmart-sync-schedules'],
    queryFn: getSyncSchedules,
  });
}
