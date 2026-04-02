export interface Launch {
  id: string;
  name: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateLaunchPayload {
  name: string;
  active: boolean;
}

export interface UpdateLaunchPayload {
  name?: string;
  active?: boolean;
}
