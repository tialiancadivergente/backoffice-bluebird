export interface VoteCampaign {
  id: string;
  slug: string;
  name: string;
  description: string;
  starts_at: string;
  ends_at: string;
  status: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  category_count: number;
  candidate_count: number;
  vote_count: number;
}
