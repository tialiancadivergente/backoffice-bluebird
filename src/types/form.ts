export interface Form {
  id: string;
  name: string;
  type: string;
  launch_id: string;
  season_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateFormPayload {
  name: string;
  type: string;
  launch_id: string;
  season_id: string;
}

export interface UpdateFormPayload {
  name?: string;
  type?: string;
  launch_id?: string;
  season_id?: string;
}
