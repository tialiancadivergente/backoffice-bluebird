import { api } from "./client";
import type { VoteCampaign, CreateVoteCampaignPayload } from "@/types/vote-campaign";

export async function fetchVoteCampaigns(): Promise<VoteCampaign[]> {
  const { data } = await api.get<VoteCampaign[]>("/v1/voting/admin/campaigns");
  return data;
}

export async function createVoteCampaign(payload: CreateVoteCampaignPayload): Promise<VoteCampaign> {
  const { data } = await api.post<VoteCampaign>("/v1/voting/admin/campaigns", payload);
  return data;
}
