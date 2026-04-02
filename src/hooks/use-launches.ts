import { useQuery } from "@tanstack/react-query";
import { fetchLaunches } from "@/api/launch";

export function useLaunches() {
  return useQuery({
    queryKey: ["launches"],
    queryFn: fetchLaunches,
  });
}
