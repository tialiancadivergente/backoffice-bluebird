// ─── Enums / literals ────────────────────────────────────────────────────────

export type MetaPublisherPlatform =
  | 'total'
  | 'facebook'
  | 'instagram'
  | 'audience_network'
  | 'messenger';

export type MetaDatePreset =
  | 'today'
  | 'yesterday'
  | 'last_7d'
  | 'last_14d'
  | 'last_30d'
  | 'last_90d'
  | 'this_month'
  | 'last_month';

export type MetaSyncStep = 'campaigns' | 'adsets' | 'ads' | 'insights' | 'full';

export type MetaSyncStatus = 'running' | 'completed' | 'failed' | 'partial' | 'aborted';

export type MetaEntityStatus =
  | 'ACTIVE'
  | 'PAUSED'
  | 'DELETED'
  | 'ARCHIVED'
  | 'IN_PROCESS'
  | 'WITH_ISSUES';

// ─── Raw structural data ──────────────────────────────────────────────────────

export type MetaCampaign = {
  id: string;
  external_account_id: string;
  external_campaign_id: string;
  campaign_name?: string;
  status?: string;
  effective_status?: string;
  objective?: string;
  payload: Record<string, unknown>;
  fetched_at: string;
  updated_at: string;
};

export type MetaAdset = {
  id: string;
  external_account_id: string;
  external_adset_id: string;
  external_campaign_id?: string;
  adset_name?: string;
  status?: string;
  effective_status?: string;
  payload: Record<string, unknown>;
  fetched_at: string;
  updated_at: string;
};

export type MetaAd = {
  id: string;
  external_account_id: string;
  external_ad_id: string;
  external_adset_id?: string;
  external_campaign_id?: string;
  ad_name?: string;
  status?: string;
  effective_status?: string;
  thumbnail_url?: string;
  payload: Record<string, unknown>;
  fetched_at: string;
  updated_at: string;
};

// ─── Performance ──────────────────────────────────────────────────────────────

export type MetaAdPerformance = {
  id: string;
  external_account_id: string;
  account_name?: string;
  external_campaign_id?: string;
  campaign_name?: string;
  external_adset_id?: string;
  adset_name?: string;
  external_ad_id: string;
  ad_name?: string;
  report_date: string;
  publisher_platform: MetaPublisherPlatform;
  impressions: string;
  clicks: string;
  reach?: string;
  inline_link_clicks?: string;
  spend: string;
  ctr?: string;
  cpc?: string;
  cpm?: string;
  leads: string;
  landing_page_views: string;
  initiate_checkouts: string;
  purchases: string;
  video_views?: string;
  video_p25_watched?: string;
  video_p50_watched?: string;
  video_p75_watched?: string;
  video_p100_watched?: string;
  video_thruplay_watched?: string;
  video_avg_time_watched?: string;
  video_30s_watched?: string;
  video_continuous_2s_watched?: string;
  connect_rate?: string;
  created_at: string;
  updated_at: string;
};

export type MetaPerformanceSummary = {
  impressions: number;
  clicks: number;
  link_clicks: number;
  reach: number;
  spend: number;
  leads: number;
  landing_page_views: number;
  initiate_checkouts: number;
  purchases: number;
  video_thruplay: number;
  // Computed
  ctr: string | null;
  cpc: string | null;
  cpm: string | null;
  connect_rate: string | null;
  checkout_rate: string | null;
  cpl: string | null;
};

export type MetaTimeseriesPoint = {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  leads: number;
  landing_page_views: number;
  initiate_checkouts: number;
  ctr: string | null;
  cpm: string | null;
  connect_rate: string | null;
};

export type MetaCampaignBreakdown = {
  campaign_id: string;
  campaign_name: string;
  impressions: number;
  clicks: number;
  spend: number;
  leads: number;
  landing_page_views: number;
  initiate_checkouts: number;
  ctr: string | null;
  cpc: string | null;
  cpm: string | null;
  cpl: string | null;
  connect_rate: string | null;
};

// ─── Sync execution history ───────────────────────────────────────────────────

export type MetaSyncExecutionMetadata = {
  totalJobs?: number;
  doneJobs?: number;
  logs?: string[];
};

export type MetaSyncExecution = {
  id: string;
  triggered_by: string;
  step: MetaSyncStep;
  status: MetaSyncStatus;
  external_account_id?: string;
  date_from?: string;
  date_to?: string;
  records_processed: number;
  error_message?: string;
  metadata?: MetaSyncExecutionMetadata;
  started_at: string;
  finished_at?: string;
};

// ─── Async job ────────────────────────────────────────────────────────────────

export type MetaAsyncJobStatus = {
  id: string;
  async_status: string;
  async_percent_completion: number;
};

// ─── Filters ─────────────────────────────────────────────────────────────────

export type MetaPerformanceFilters = {
  accountId?: string;
  campaignId?: string;
  dateFrom?: string;
  dateTo?: string;
  platform?: MetaPublisherPlatform;
};

export type MetaSyncPayload = {
  connectionId?: string;
  accountIds?: string[];
  datePreset?: MetaDatePreset;
  since?: string;
  until?: string;
  level?: 'ad' | 'adset' | 'campaign';
  breakdowns?: string;
};

export type MetaInsightsJobPayload = {
  connectionId: string;
  nodeId: string;
  since: string;
  until: string;
  level?: string;
  fields?: string[];
  breakdowns?: string;
};

export type MetaBulkInsightsPayload = {
  connectionId?: string;
  accountIds?: string[];
  since: string;
  until: string;
  level?: string;
  breakdowns?: string;
  chunkDays?: number;
};

// ─── Paginated response ───────────────────────────────────────────────────────

export type MetaPagedResult<T> = {
  items: T[];
  total: number;
};

export type MetaSyncStep = 'insights' | 'campaigns' | 'adsets' | 'ads' | 'full' | 'insights_bulk';

export interface MetaSyncSchedule {
  id: string;
  name?: string;
  sync_step: MetaSyncStep;
  period_preset: 'yesterday' | 'last_7d' | 'last_30d' | 'last_90d' | 'custom';
  date_from?: string;
  date_to?: string;
  level: string;
  scheduled_time: string;
  active: boolean;
  last_run_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMetaSyncSchedulePayload {
  name?: string;
  sync_step: MetaSyncStep;
  period_preset: 'yesterday' | 'last_7d' | 'last_30d' | 'last_90d' | 'custom';
  date_from?: string;
  date_to?: string;
  level?: string;
  scheduled_time: string;
  active?: boolean;
}
