import axios from "axios";
import type {
  CreateHotmartProductPayload,
  HotmartProduct,
  HotmartSale,
  HotmartSalesFilters,
  HotmartSummary,
  HotmartSummaryFilters,
  UpdateHotmartProductPayload,
} from "@/types/hotmart";
import { LEADS_API_BASE_URL, LEADS_API_HEADERS } from "@/api/leads-api-config";

const hotmartClient = axios.create({
  baseURL: LEADS_API_BASE_URL,
  headers: LEADS_API_HEADERS,
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
    {},
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
    {},
    { params },
  );
  return data;
}

export async function getHotmartProducts(): Promise<HotmartProduct[]> {
  const { data } = await hotmartClient.get<HotmartProduct[]>('/hotmart/products');
  return data;
}

export async function createHotmartProduct(payload: CreateHotmartProductPayload): Promise<HotmartProduct> {
  const { data } = await hotmartClient.post<HotmartProduct>('/hotmart/products', payload);
  return data;
}

export async function updateHotmartProduct(id: string, payload: UpdateHotmartProductPayload): Promise<HotmartProduct> {
  const { data } = await hotmartClient.patch<HotmartProduct>(`/hotmart/products/${id}`, payload);
  return data;
}

export async function deleteHotmartProduct(id: string): Promise<void> {
  await hotmartClient.delete(`/hotmart/products/${id}`);
}
