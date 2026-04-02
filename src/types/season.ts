export interface Season {
  id: string;
  name: string;
  active: boolean;
  launch_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSeasonPayload {
  name: string;
  active: boolean;
  launch_id: string;
}

export interface UpdateSeasonPayload {
  name?: string;
  active?: boolean;
  launch_id?: string;
}
