import axios from "axios";
import type {
  HotmartSale,
  HotmartSalesFilters,
  HotmartSummary,
  HotmartSummaryFilters,
} from "@/types/hotmart";

const hotmartClient = axios.create({
  baseURL: "https://leads-api.aliancadivergente.com.br",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "lsk_prod_v1_W7mQ9nX2fK8rT4yP6cV3uJ1hD5sL0aB8eR2qN7tY4zM9pC6xG1kF5vH3jS8dU2",
  },
});

function sanitizeParams(params: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  );
}

export async function getSales(
  filters: HotmartSalesFilters,
): Promise<{ data: HotmartSale[]; total: number }> {
  const { data } = await hotmartClient.get<{ data: HotmartSale[]; total: number }>(
    "/hotmart/sales",
    { params: sanitizeParams({ ...filters, page: filters.page ?? 1, limit: filters.limit ?? 20 }) },
  );
  return data;
}

export async function getSalesSummary(filters: HotmartSummaryFilters): Promise<HotmartSummary> {
  const { data } = await hotmartClient.get<HotmartSummary>("/hotmart/sales/summary", {
    params: sanitizeParams(filters as Record<string, unknown>),
  });
  return data;
}

export async function syncHistory(params: {
  startDate?: string;
  endDate?: string;
  transactionStatus?: string;
}): Promise<{ status: string; message: string }> {
  const { data } = await hotmartClient.post<{ status: string; message: string }>(
    "/hotmart/sync-history",
    null,
    { params: sanitizeParams(params as Record<string, unknown>) },
  );
  return data;
}

export async function processBatch(
  limit?: number,
): Promise<{ processed: number; failed: number }> {
  const params = limit === undefined ? {} : { limit };
  const { data } = await hotmartClient.post<{ processed: number; failed: number }>(
    "/hotmart/process-batch",
    null,
    { params },
  );
  return data;
}
