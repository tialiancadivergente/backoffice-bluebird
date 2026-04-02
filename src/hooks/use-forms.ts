import { useQuery } from "@tanstack/react-query";
import { fetchForms } from "@/api/form";

export function useForms() {
  return useQuery({
    queryKey: ["forms"],
    queryFn: () => fetchForms(),
  });
}
