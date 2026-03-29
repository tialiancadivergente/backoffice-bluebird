import { api } from "./client";
import type { VoteCampaign } from "@/types/vote-campaign";

export async function fetchVoteCampaigns(): Promise<VoteCampaign[]> {
  const { data } = await api.get<VoteCampaign[]>("/v1/voting/admin/campaigns");
  return data;
}
