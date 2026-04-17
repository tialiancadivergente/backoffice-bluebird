export interface MarketingDashboardFilters {
  provider?: string;
  externalAccountId?: string;
  externalCampaignId?: string;
  externalAdsetId?: string;
  externalAdId?: string;
  dateFrom?: string;
  dateTo?: string;
  launchId?: string;
  seasonId?: string;
}

export interface MarketingDashboardFilterOption {
  value: string;
  label: string;
}

export interface MarketingDashboardFilterOptions {
  providers: MarketingDashboardFilterOption[];
  accounts: MarketingDashboardFilterOption[];
  campaigns: MarketingDashboardFilterOption[];
  adsets: MarketingDashboardFilterOption[];
  ads: MarketingDashboardFilterOption[];
  launches: MarketingDashboardFilterOption[];
  seasons: MarketingDashboardFilterOption[];
}

export interface MarketingDashboardFiltersResponse {
  filters?: MarketingDashboardFilters;
  options: MarketingDashboardFilterOptions;
}

export interface MarketingDashboardSummaryMetrics {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  registrations: number;
  cpc: number | null;
  ctr: number | null;
  cpm: number | null;
  cpl: number | null;
}

export interface MarketingDashboardSummaryResponse {
  filters?: MarketingDashboardFilters;
  summary: MarketingDashboardSummaryMetrics;
}

export interface MarketingDashboardTimeseriesPoint {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  registrations: number;
  cpc: number | null;
  ctr: number | null;
  cpm: number | null;
  cpl: number | null;
}

export interface MarketingDashboardTimeseriesResponse {
  filters?: MarketingDashboardFilters;
  timeseries: MarketingDashboardTimeseriesPoint[];
}

export interface MarketingDashboardTableItem {
  provider: string | null;
  externalAccountId: string | null;
  accountName: string | null;
  externalCampaignId: string | null;
  campaignName: string | null;
  externalAdsetId: string | null;
  adsetName: string | null;
  externalAdId: string | null;
  adName: string | null;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  registrations: number;
  cpc: number | null;
  ctr: number | null;
  cpm: number | null;
  cpl: number | null;
}

export type MarketingDashboardSortOrder = "asc" | "desc";

export interface MarketingDashboardTableParams extends MarketingDashboardFilters {
  page: number;
  perPage: number;
  sortBy?: keyof MarketingDashboardTableItem;
  sortOrder?: MarketingDashboardSortOrder;
}

export interface MarketingDashboardTableMeta {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

export interface MarketingDashboardTableResponse {
  filters?: MarketingDashboardFilters;
  items: MarketingDashboardTableItem[];
  meta: MarketingDashboardTableMeta;
}
