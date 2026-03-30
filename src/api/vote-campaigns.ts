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

export async function deleteVoteCampaign(id: string): Promise<void> {
  await votingClient.delete(`/v1/voting/admin/campaigns/${id}`);
}

export interface VoteCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  campaign_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  description: string;
}

export async function fetchCategories(campaignId: string): Promise<VoteCategory[]> {
  const { data } = await votingClient.get<VoteCategory[]>(`/v1/voting/admin/campaigns/${campaignId}/categories`);
  return data;
}

export async function createCategory(campaignId: string, payload: CreateCategoryPayload): Promise<VoteCategory> {
  const { data } = await votingClient.post<VoteCategory>(`/v1/voting/admin/campaigns/${campaignId}/categories`, payload);
  return data;
}

export async function deleteCategory(campaignId: string, categoryId: string): Promise<void> {
  await votingClient.delete(`/v1/voting/admin/campaigns/${campaignId}/categories/${categoryId}`);
}

export interface VoteCandidate {
  id: string;
  name: string;
  story_text: string;
  photo_url: string;
  category_id: string;
  campaign_id: string;
  display_order: number;
  active: boolean;
  vote_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCandidatePayload {
  category_id: string;
  name: string;
  story_text: string;
  photo_url?: string;
  display_order: number;
  active: boolean;
}

export async function fetchCandidates(campaignId: string): Promise<VoteCandidate[]> {
  const { data } = await votingClient.get<VoteCandidate[]>(`/v1/voting/admin/campaigns/${campaignId}/candidates`);
  return data;
}

export async function createCandidate(campaignId: string, payload: CreateCandidatePayload): Promise<VoteCandidate> {
  const { data } = await votingClient.post<VoteCandidate>(`/v1/voting/admin/campaigns/${campaignId}/candidates`, payload);
  return data;
}

export async function deleteCandidate(campaignId: string, candidateId: string): Promise<void> {
  await votingClient.delete(`/v1/voting/admin/campaigns/${campaignId}/candidates/${candidateId}`);
}

export async function fetchCampaignResults(campaignId: string): Promise<VoteCandidate[]> {
  const { data } = await votingClient.get<VoteCandidate[]>(`/v1/voting/admin/campaigns/${campaignId}/results`);
  return data;
}
