export interface LeadCapture {
  id: string;
  page: string;
  path: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  utm_id: string;
  created_at: string;
  person_id: string;
  person_email: string;
  person_phone: string;
  platform_id: string;
  platform_name: string;
  strategy_id: string;
  strategy_name: string;
  temperature_id: string;
  temperature_name: string;
  launch_id: string;
  launch_name: string;
  season_id: string;
  season_name: string;
  tag_id: string;
  tag_name: string;
  ad_id: string;
  ad_name: string;
  external_ad_id: string;
  external_ad_name: string;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
}

export interface LeadCaptureResponse {
  items: LeadCapture[];
  meta: PaginationMeta;
}

export interface LeadCaptureParams {
  page: number;
  per_page: number;
  start_date?: string;
  end_date?: string;
  temperature_id?: string;
}

export interface LeadExportParams {
  start_date?: string;
  end_date?: string;
  temperature_id?: string;
}

export interface Temperature {
  id: string;
  name: string;
  abbreviation: string;
}

export interface Launch {
  id: string;
  name: string;
}
