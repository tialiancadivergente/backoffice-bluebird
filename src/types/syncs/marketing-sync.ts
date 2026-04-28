export interface SelectOption {
  value: string;
  label: string;
}

export interface OAuthConnection {
  id: string;
  provider: string;
  userName: string | null;
  status: string | null;
  connectionId: string;
  selectedAccountId: string | null;
  selectedAccountName: string | null;
  raw?: Record<string, unknown>;
}

export interface OAuthConnectionAccount {
  id: string;
  accountId: string;
  accountName: string | null;
  currency: string | null;
  timezone: string | null;
  selected: boolean;
  raw?: Record<string, unknown>;
}

export interface MarketingSyncAccount {
  id: string;
  provider: string;
  connectionId: string | null;
  accountId: string;
  accountName: string | null;
  status: string | null;
  selected: boolean;
  raw?: Record<string, unknown>;
}

export interface MarketingSyncJob {
  id: string;
  provider: string | null;
  connectionId: string | null;
  accountId: string | null;
  accountName: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  status: string | null;
  error: string | null;
  createdAt: string | null;
  raw?: Record<string, unknown>;
}

export interface MarketingSyncFilters {
  provider?: string;
  connectionId?: string;
}

export interface MarketingSyncRawItem {
  id: string;
  provider: string | null;
  connectionId: string | null;
  accountId: string | null;
  date: string | null;
  payload: Record<string, unknown>;
}

export interface MarketingSyncPerformanceItem {
  id: string;
  provider: string | null;
  accountId: string | null;
  date: string | null;
  metrics: Record<string, unknown>;
}

export interface CreateDailyJobsPayload {
  provider?: string;
}

export interface CreateManualJobsPayload {
  provider: string;
  accountId?: string;
  dateFrom: string;
  dateTo: string;
  enqueue: true;
}

export interface MarketingSyncConfiguration {
  id: string;
  syncKey: string;
  provider: string | null;
  enabled: boolean;
  scheduleEnabled: boolean;
  scheduleIntervalMinutes: number | null;
  config: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export type MarketingSyncConfigurationPayload = Omit<MarketingSyncConfiguration, "id" | "createdAt" | "updatedAt">;
