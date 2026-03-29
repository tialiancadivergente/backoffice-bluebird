import axios from "axios";
import type { VoteCampaign, CreateVoteCampaignPayload } from "@/types/vote-campaign";

const votingClient = axios.create({
  baseURL: "https://leads-api.aliancadivergente.com.br",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "lsk_prod_v1_W7mQ9nX2fK8rT4yP6cV3uJ1hD5sL0aB8eR2qN7tY4zM9pC6xG1kF5vH3jS8dU2",
  },
});

export async function fetchVoteCampaigns(): Promise<VoteCampaign[]> {
  const { data } = await votingClient.get<VoteCampaign[]>("/v1/voting/admin/campaigns");
  return data;
}

export async function createVoteCampaign(payload: CreateVoteCampaignPayload): Promise<VoteCampaign> {
  const { data } = await votingClient.post<VoteCampaign>("/v1/voting/admin/campaigns", payload);
  return data;
}
