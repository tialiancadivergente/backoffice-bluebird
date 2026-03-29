import { useQuery } from "@tanstack/react-query";
import { fetchVoteCampaigns } from "@/api/vote-campaigns";

export function useVoteCampaigns() {
  return useQuery({
    queryKey: ["vote-campaigns"],
    queryFn: fetchVoteCampaigns,
  });
}
