import { useQuery } from "@tanstack/react-query";
import { fetchSeasons } from "@/api/season";

export function useSeasons(launchId?: string) {
  return useQuery({
    queryKey: ["seasons", launchId],
    queryFn: () => fetchSeasons(launchId),
  });
}
