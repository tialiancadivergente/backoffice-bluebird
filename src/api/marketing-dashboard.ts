import axios from "axios";
import type {
  MarketingDashboardFilterOption,
  MarketingDashboardFiltersResponse,
  MarketingDashboardFilters,
  MarketingDashboardSummaryResponse,
  MarketingDashboardTableItem,
  MarketingDashboardTableParams,
  MarketingDashboardTableResponse,
  MarketingDashboardTimeseriesResponse,
} from "@/types/marketing-dashboard";

const API_BASE_URL = "https://leads-api.aliancadivergente.com.br";

const normalizedBaseUrl = API_BASE_URL.replace(/\/+$/, "");
const hasMarketingDashboardPrefix = /\/marketing-dashboard$/i.test(normalizedBaseUrl);

const marketingDashboardClient = axios.create({
  baseURL: normalizedBaseUrl,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "lsk_prod_v1_W7mQ9nX2fK8rT4yP6cV3uJ1hD5sL0aB8eR2qN7tY4zM9pC6xG1kF5vH3jS8dU2",
  },
});

function buildDashboardPath(resource: "summary" | "timeseries" | "table" | "filters") {
  if (hasMarketingDashboardPrefix) {
    return `/${resource}`;
  }

  return `/marketing-dashboard/${resource}`;
}

function extractErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const apiMessage =
      error.response?.data && typeof error.response.data === "object"
        ? (error.response.data as { message?: string }).message
        : undefined;

    return apiMessage || error.message || fallback;
  }

  return fallback;
}

function normalizeTableItem(item: Partial<MarketingDashboardTableItem>): MarketingDashboardTableItem {
  return {
    provider: item.provider ?? null,
    externalAccountId: item.externalAccountId ?? null,
    accountName: item.accountName ?? null,
    externalCampaignId: item.externalCampaignId ?? null,
    campaignName: item.campaignName ?? null,
    externalAdsetId: item.externalAdsetId ?? null,
    adsetName: item.adsetName ?? null,
    externalAdId: item.externalAdId ?? null,
    adName: item.adName ?? null,
    spend: Number(item.spend ?? 0),
    impressions: Number(item.impressions ?? 0),
    clicks: Number(item.clicks ?? 0),
    conversions: Number(item.conversions ?? 0),
    registrations: Number(item.registrations ?? 0),
    cpc: item.cpc == null ? null : Number(item.cpc),
    ctr: item.ctr == null ? null : Number(item.ctr),
    cpm: item.cpm == null ? null : Number(item.cpm),
    cpl: item.cpl == null ? null : Number(item.cpl),
  };
}

function getItemsFromResponse(data: unknown, record: Record<string, unknown>) {
  if (Array.isArray(record.items)) return record.items;
  if (Array.isArray(record.table)) return record.table;
  if (Array.isArray(record.rows)) return record.rows;
  if (Array.isArray(data)) return data;
  return [];
}

function toSafeMeta(record: Record<string, unknown>) {
  if (record.meta && typeof record.meta === "object") {
    return record.meta as Record<string, unknown>;
  }

  return {};
}

function getPositiveNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  return fallback;
}

function getNonNegativeNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }

  return fallback;
}

function sanitizeFiltersParams(filters: MarketingDashboardFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

function normalizeFilterOption(option: unknown): MarketingDashboardFilterOption | null {
  if (!option || typeof option !== "object") {
    return null;
  }

  const item = option as Record<string, unknown>;

  const rawValue = item.value;
  let value = "";

  if (typeof rawValue === "string") {
    value = rawValue;
  } else if (typeof rawValue === "number" || typeof rawValue === "boolean") {
    value = String(rawValue);
  }

  const label = typeof item.label === "string" ? item.label : value;

  if (!value) {
    return null;
  }

  return { value, label };
}

function normalizeFilterOptions(data: unknown): MarketingDashboardFiltersResponse["options"] {
  const fallback: MarketingDashboardFiltersResponse["options"] = {
    providers: [],
    accounts: [],
    campaigns: [],
    adsets: [],
    ads: [],
    launches: [],
    seasons: [],
  };

  if (!data || typeof data !== "object") {
    return fallback;
  }

  const options = data as Record<string, unknown>;
  const mapList = (key: keyof MarketingDashboardFiltersResponse["options"]) => {
    const raw = options[key];
    if (!Array.isArray(raw)) {
      return fallback[key];
    }

    return raw.map(normalizeFilterOption).filter((item): item is MarketingDashboardFilterOption => item !== null);
  };

  return {
    providers: mapList("providers"),
    accounts: mapList("accounts"),
    campaigns: mapList("campaigns"),
    adsets: mapList("adsets"),
    ads: mapList("ads"),
    launches: mapList("launches"),
    seasons: mapList("seasons"),
  };
}

function normalizeTableResponse(
  data: unknown,
  requestedPage: number,
  requestedPerPage: number,
): MarketingDashboardTableResponse {
  const fallback: MarketingDashboardTableResponse = {
    filters: undefined,
    items: [],
    meta: {
      page: requestedPage,
      perPage: requestedPerPage,
      totalItems: 0,
      totalPages: 0,
    },
  };

  if (!data || typeof data !== "object") {
    return fallback;
  }

  const record = data as Record<string, unknown>;
  const rawItems = getItemsFromResponse(data, record);

  const items = rawItems
    .filter((item): item is Partial<MarketingDashboardTableItem> => typeof item === "object" && item !== null)
    .map(normalizeTableItem);

  const rawMeta = toSafeMeta(record);

  const page = getPositiveNumber(rawMeta.page ?? rawMeta.currentPage, requestedPage);
  const perPage = getPositiveNumber(rawMeta.perPage ?? rawMeta.per_page, requestedPerPage);
  const totalItems = getNonNegativeNumber(rawMeta.totalItems ?? rawMeta.total_items ?? rawMeta.total, items.length);
  const derivedTotalPages = perPage > 0 ? Math.ceil(totalItems / perPage) : 0;
  const totalPages = getNonNegativeNumber(rawMeta.totalPages ?? rawMeta.total_pages, derivedTotalPages);

  return {
    filters: (record.filters as MarketingDashboardFilters | undefined) ?? undefined,
    items,
    meta: {
      page,
      perPage,
      totalItems,
      totalPages,
    },
  };
}

export async function getMarketingDashboardSummary(
  params: MarketingDashboardFilters,
): Promise<MarketingDashboardSummaryResponse> {
  try {
    const { data } = await marketingDashboardClient.get<MarketingDashboardSummaryResponse>(buildDashboardPath("summary"), {
      params: sanitizeFiltersParams(params),
    });

    return {
      filters: data?.filters,
      summary: {
        spend: Number(data?.summary?.spend ?? 0),
        impressions: Number(data?.summary?.impressions ?? 0),
        clicks: Number(data?.summary?.clicks ?? 0),
        conversions: Number(data?.summary?.conversions ?? 0),
        registrations: Number(data?.summary?.registrations ?? 0),
        cpc: data?.summary?.cpc == null ? null : Number(data.summary.cpc),
        ctr: data?.summary?.ctr == null ? null : Number(data.summary.ctr),
        cpm: data?.summary?.cpm == null ? null : Number(data.summary.cpm),
        cpl: data?.summary?.cpl == null ? null : Number(data.summary.cpl),
      },
    };
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Nao foi possivel carregar o resumo do dashboard."));
  }
}

export async function getMarketingDashboardTimeseries(
  params: MarketingDashboardFilters,
): Promise<MarketingDashboardTimeseriesResponse> {
  try {
    const { data } = await marketingDashboardClient.get<MarketingDashboardTimeseriesResponse>(
      buildDashboardPath("timeseries"),
      {
        params: sanitizeFiltersParams(params),
      },
    );

    const timeseries = Array.isArray(data?.timeseries)
      ? [...data.timeseries]
          .map((point) => ({
            ...point,
            spend: Number(point.spend ?? 0),
            impressions: Number(point.impressions ?? 0),
            clicks: Number(point.clicks ?? 0),
            conversions: Number(point.conversions ?? 0),
            registrations: Number(point.registrations ?? 0),
            cpc: point.cpc == null ? null : Number(point.cpc),
            ctr: point.ctr == null ? null : Number(point.ctr),
            cpm: point.cpm == null ? null : Number(point.cpm),
            cpl: point.cpl == null ? null : Number(point.cpl),
          }))
          .sort((a, b) => a.date.localeCompare(b.date))
      : [];

    return {
      filters: data?.filters,
      timeseries,
    };
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Nao foi possivel carregar o grafico do dashboard."));
  }
}

export async function getMarketingDashboardTable(
  params: MarketingDashboardTableParams,
): Promise<MarketingDashboardTableResponse> {
  try {
    const { page, perPage, sortBy, sortOrder, ...filters } = params;

    const { data } = await marketingDashboardClient.get(buildDashboardPath("table"), {
      params: {
        ...sanitizeFiltersParams(filters),
        page,
        perPage,
        sortBy,
        sortOrder,
      },
    });

    return normalizeTableResponse(data, params.page, params.perPage);
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Nao foi possivel carregar a tabela do dashboard."));
  }
}

export async function getMarketingDashboardFilters(
  params: MarketingDashboardFilters,
): Promise<MarketingDashboardFiltersResponse> {
  try {
    const { data } = await marketingDashboardClient.get<MarketingDashboardFiltersResponse>(buildDashboardPath("filters"), {
      params: sanitizeFiltersParams(params),
    });

    return {
      filters: data?.filters,
      options: normalizeFilterOptions(data?.options),
    };
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Nao foi possivel carregar as opcoes de filtros."));
  }
}
