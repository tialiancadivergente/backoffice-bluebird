import { useQuery } from "@tanstack/react-query";
import { fetchLeadCaptures } from "@/api/lead-capture";
import type { LeadCaptureParams } from "@/types/lead-capture";

export function useLeadCaptures(params: LeadCaptureParams) {
  return useQuery({
    queryKey: ["lead-captures", params],
    queryFn: () => fetchLeadCaptures(params),
    placeholderData: (prev) => prev,
  });
}
