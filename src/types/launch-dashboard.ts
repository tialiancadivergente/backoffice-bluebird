export interface LaunchDashboardFilters {
  launchId?: string;
  seasonId?: string;
  dateFrom?: string;
  dateTo?: string;
  externalAccountId?: string;
  externalCampaignId?: string;
  externalAdsetId?: string;
  externalAdId?: string;
}

export interface LaunchDashboardSummary {
  spend: number;
  impressions: number;
  clicks: number;
  inlineLinkClicks: number;
  landingPageViews: number;
  leads: number;
  initiateCheckouts: number;
  sales: number;
  revenue: number;
  // derived
  ctr: number | null;
  cpc: number | null;
  cpm: number | null;
  connectRate: number | null;
  txPgvCheckout: number | null;
  txCheckoutSale: number | null;
  cpl: number | null;
  cpa: number | null;
}

export interface LaunchDashboardTimeseriesPoint {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  sales: number;
  ctr: number | null;
  cpl: number | null;
}

export interface LaunchFunnelRow {
  externalAdId: string;
  adName: string | null;
  externalCampaignId: string | null;
  campaignName: string | null;
  externalAdsetId: string | null;
  adsetName: string | null;
  externalAccountId: string | null;
  accountName: string | null;
  // media
  spend: number;
  impressions: number;
  clicks: number;
  inlineLinkClicks: number;
  landingPageViews: number;
  initiateCheckouts: number;
  // crm
  leads: number;
  sales: number;
  revenue: number;
  // derived
  ctr: number | null;
  cpc: number | null;
  cpm: number | null;
  connectRate: number | null;
  txPgvCheckout: number | null;
  txCheckoutSale: number | null;
  cpl: number | null;
  cpa: number | null;
}

export interface LaunchDashboardSummaryResponse {
  summary: LaunchDashboardSummary;
}

export interface LaunchDashboardTimeseriesResponse {
  timeseries: LaunchDashboardTimeseriesPoint[];
}

export interface LaunchDashboardFunnelResponse {
  items: LaunchFunnelRow[];
  total: number;
}

export interface LaunchOption {
  id: string;
  name: string;
  active: boolean;
}
